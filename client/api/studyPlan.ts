import client from './client'; // adjust path if needed

/* ----------------------------------
   GET TODAY'S PLAN
----------------------------------- */

export const getTodayPlan = async () => {
  const res = await client.get('/study-plan/today');

  // Backend returns: { plan, warning }
  if (!res.data?.plan) {
    // It's possible we just generated it and it returned null if empty, 
    // but usually getToday returns 404 if truly nothing.
    // If it returns 200 but plan is null, that's empty state.
    return { plan: null, warning: res.data?.warning };
  }

  return { plan: res.data.plan, warning: res.data.warning };
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

export const regeneratePlan = async (skip: boolean = false) => {
  const res = await client.post('/study-plan/regenerate', { skip });

  // Backend returns: { message, plan, warning }
  if (!res.data?.plan) {
    return { plan: null, warning: res.data?.warning };
  }

  return { plan: res.data.plan, warning: res.data.warning };
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

