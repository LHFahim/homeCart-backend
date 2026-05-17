import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SerializeService } from 'libraries/serializer/serialize';
import {
  AuthResponseDto,
  LoginDto,
  ResetPasswordDto,
  ResetPasswordSendCodeDto,
  ResetPasswordVerifyCodeDto,
  UserProfileDto,
  VerifyEmailDto,
} from 'src/auth/dto/auth.dto';
import { AuthProvider, PanelType } from 'src/common/enum/auth.enum';
import { ConfigService } from 'src/config/config.service';
import { UserDto } from 'src/user/dto/user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { AdminRegisterDto } from './dto/admin-auth.dto';

@Injectable()
export class AdminAuthService extends SerializeService<UserEntity> {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,

    private configService: ConfigService,
  ) {
    super(UserEntity);
  }

  async onModuleInit() {
    const user = await this.userService.findUserByEmail(
      this.configService.adminUserCredential.adminUserEmail,
    );

    if (!user) {
      await this.userService.createUser({
        email: this.configService.adminUserCredential.adminUserEmail,
        password: await this.getHashedPassword(
          this.configService.adminUserCredential.adminUserPass,
        ),
        firstName: 'Admin',
        lastName: 'Admin',
        phone: '',
        panelType: PanelType.ADMIN,
      });
    }
  }

  private readonly THREE_MINUTE = 1000 * 60 * 3;

  async register(dto: AdminRegisterDto) {
    const user = await this.userService.findUserByPanel(
      dto.email,
      PanelType.ADMIN,
    );
    if (user)
      throw new ConflictException('User already exists with this email');

    dto.password = await this.getHashedPassword(dto.password);

    const newUser = await this.userService.createUser({
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      password: dto.password,

      email: dto.email,
      panelType: PanelType.ADMIN,
    });

    return this.getAuthResponse(newUser);
  }

  async login({ email, password }: LoginDto) {
    const user = await await this.userService.findUserByPanel(
      email,
      PanelType.ADMIN,
    );

    if (!user) throw new NotFoundException('User is not found');

    if (!(await bcrypt.compare(password, user.password)))
      throw new BadRequestException('Invalid password');
    if (!user.isActive) throw new HttpException('Account Inactive', 423);

    return this.getAuthResponse(user);
  }

  private static async generateSalt() {
    return await bcrypt.genSalt(10);
  }

  async getAuthResponse(user: UserDto): Promise<AuthResponseDto> {
    const access_token = await this.jwtService.signAsync(
      { id: user._id, type: 'access_token' },
      { expiresIn: this.configService.JWT_ACCESS_TOKEN_EXPIRES_IN },
    );
    const refresh_token = await this.jwtService.signAsync(
      { id: user._id, type: 'refresh_token' },
      { expiresIn: this.configService.JWT_REFRESH_TOKEN_EXPIRES_IN },
    );

    return {
      access_token,
      refresh_token,
      user: this.toJSON(user, UserProfileDto),
    };
  }

  private async getHashedPassword(password: string) {
    const salt = await AdminAuthService.generateSalt();
    return await bcrypt.hash(password, salt);
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmNewPassword)
      throw new BadRequestException('Passwords do not match');

    const user = await this.userService.findUserByPanel(
      dto.email,
      PanelType.ADMIN,
    );
    if (!user) throw new NotFoundException('User is not found');
    if (user.authProvider !== AuthProvider.EMAIL)
      throw new BadRequestException(
        'Reset password only works with email registration',
      );

    user.password = await this.getHashedPassword(dto.newPassword);
    await user.save();

    return 'Password reset successful';
  }

  async resetPasswordSendCode(dto: ResetPasswordSendCodeDto) {
    const user = await this.userService.findUserByPanel(
      dto.email,
      PanelType.ADMIN,
    );
    if (!user) throw new NotFoundException('User is not found');
    if (user.authProvider !== AuthProvider.EMAIL)
      throw new BadRequestException(
        'Reset password only works with email registration',
      );

    return 'OTP sent';
  }

  async resetPasswordVerifyCode(dto: ResetPasswordVerifyCodeDto) {
    const user = await this.userService.findUserByPanel(
      dto.email,
      PanelType.ADMIN,
    );
    if (!user) throw new NotFoundException('User is not found');

    if (user.authProvider !== AuthProvider.EMAIL)
      throw new BadRequestException(
        'Resend verification code only works with email registration',
      );

    return 'OTP verified';
  }

  generateToken = (
    length = 6,
    type: 'simple' | 'full' | 'extended' = 'simple',
  ) => {
    let letters = '';

    switch (type) {
      case 'simple':
        letters += '0123456789';
        break;
      case 'full':
        letters += 'abcdefghijklmnopqrstuvwxyz';
        break;
      case 'extended':
        letters += `_^$@abcdefghijklmnopqrstuvwxyz${'abcdefghijklmnopqrstuvwxyz'.toUpperCase()}`;
        break;
    }

    let OTP = '';

    for (let i = 0; i < length; i++) {
      OTP += letters[Math.floor(Math.random() * letters.length)];
    }

    return OTP;
  };

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.userService.findUserByPanel(
      dto.email,
      PanelType.ADMIN,
    );
    if (!user) throw new NotFoundException('User is not found');
    if (user.isEmailVerified)
      throw new BadRequestException('User is already verified');
    if (user.authProvider !== AuthProvider.EMAIL)
      throw new BadRequestException(
        'Email verification only works with email registration',
      );

    user.isEmailVerified = true;
    await user.save();

    return 'Email verified';
  }

  async sendVerificationEmail(userId: string) {
    const user = await this.userService.findUserById(userId);
    if (!user) throw new NotFoundException('User is not found');
    if (user.isEmailVerified)
      throw new BadRequestException('User is already verified');
    if (user.authProvider !== AuthProvider.EMAIL)
      throw new BadRequestException(
        'Resend verification code only works with email registration',
      );

    const token = this.generateToken();

    return 'OTP sent';
  }
}
