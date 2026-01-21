import client from './client'; // adjust path if needed

/* ----------------------------------
   GET TODAY'S PLAN
----------------------------------- */

export const getTodayPlan = async () => {
  const res = await client.get('/study-plan/today');

  // Backend returns: { plan }
  if (!res.data?.plan) {
    throw new Error('No plan returned');
  }

  return res.data.plan;
};

/* ----------------------------------
   GENERATE PLAN (FIRST TIME)
----------------------------------- */

export const generatePlan = async () => {
  const res = await client.post('/study-plan/generate');

  // Some endpoints may only return message
  return res.data;
};

/* ----------------------------------
   REGENERATE / SKIP DAY
----------------------------------- */

export const regeneratePlan = async () => {
  const res = await client.post('/study-plan/regenerate');

  // Backend returns: { message, plan }
  if (!res.data?.plan) {
    throw new Error('No regenerated plan returned');
  }

  return res.data.plan;
};

/* ----------------------------------
   GET PLAN BY DATE (OPTIONAL)
----------------------------------- */

export const getPlanByDate = async (date: string) => {
  const res = await client.get('/study-plan/by-date', {
    params: { date },
  });

  if (!res.data?.plan) {
    throw new Error('Plan not found for date');
  }

  return res.data.plan;
};
