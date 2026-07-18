const triggerUrl = process.env.REMINDER_TRIGGER_URL;
const cronSecret = process.env.CRON_SECRET;
const reminderTimezone = process.env.REMINDER_TIMEZONE || 'Australia/Sydney';

const forceRun = process.env.FORCE_REMINDER_RUN === 'true';

if (!triggerUrl) {
  console.error('REMINDER_TRIGGER_URL is missing.');
  process.exit(1);
}

if (!cronSecret) {
  console.error('CRON_SECRET is missing.');
  process.exit(1);
}

function getCurrentLocalTime(timeZone) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const hour = Number(parts.find((part) => part.type === 'hour')?.value);

  const minute = Number(parts.find((part) => part.type === 'minute')?.value);

  return { hour, minute };
}

async function main() {
  const { hour, minute } = getCurrentLocalTime(reminderTimezone);
  const localTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(
    2,
    '0',
  )}`;

  console.log(`Current time in ${reminderTimezone}: ${localTime}`);

  const isScheduledTime = (hour === 15 || hour === 23) && minute === 0;

  if (!forceRun && !isScheduledTime) {
    console.log('Run mode: skipped (not an exact scheduled time).');
    return;
  }

  if (forceRun) {
    console.log('Run mode: forced (FORCE_REMINDER_RUN=true).');
  } else {
    console.log('Run mode: scheduled (exact local time match).');
  }

  console.log('Triggering high-priority reminders...');

  const response = await fetch(triggerUrl, {
    method: 'POST',
    headers: {
      'x-cron-secret': cronSecret,
      Accept: 'application/json',
    },
  });

  const responseBody = await response.text();

  console.log(`Reminder endpoint returned HTTP ${response.status}.`);
  console.log(responseBody);

  if (!response.ok) {
    throw new Error(`Reminder endpoint failed with HTTP ${response.status}.`);
  }
}

main().catch((error) => {
  console.error(
    'Could not trigger high-priority reminders:',
    error instanceof Error ? error.message : error,
  );

  process.exit(1);
});
