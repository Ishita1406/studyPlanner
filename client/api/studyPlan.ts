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
  // If no plan (e.g. no topics), return null instead of throwing
  if (!res.data?.plan) {
    return null;
  }

  return res.data.plan;
};

/* ----------------------------------
   GET PLAN BY DATE (OPTIONAL)
----------------------------------- */

export const getPlanByDate = async (date: string) => {
  try {
    const res = await client.get('/study-plan/by-date', {
      params: { date },
    });

    return res.data.plan;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null; // ✅ NORMAL: no plan for this date
    }
    throw error; // ❌ real errors only
  }
};

export const getDatesWithPlans = async () => {
  const res = await client.get('/study-plan/dates');
  return res.data.dates; // ["2026-01-21", ...]
};

export const removeTaskFromPlan = async (topicId: string) => {
  const res = await client.delete(`/study-plan/task/${topicId}`);
  return res.data;
};

