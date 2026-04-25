export default {
  async fetch(request, env) {
    // 1. Get the user's IP address
    const ip = request.headers.get('cf-connecting-ip');
    const lockKey = `lockout_${ip}`;
    
    // 2. Check if they are currently locked out
    const isLocked = await env.ATTEMPTS.get(lockKey);
    if (isLocked) {
      return new Response(JSON.stringify({ status: 'locked', message: 'Too many tries! Wait a minute.' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 3. Get the key they sent
    const { userKey } = await request.json();

    // 4. Check the key (Replace 'MY_REAL_KEY' with your actual secret)
    if (userKey === 'MY_REAL_KEY') {
      return new Response(JSON.stringify({ status: 'success' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } else {
      // 5. If wrong, set a lockout for 60 seconds in the KV storage
      await env.ATTEMPTS.put(lockKey, 'true', { expirationTtl: 60 });
      return new Response(JSON.stringify({ status: 'wrong' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
