import { createClient } from '@/utils/supabase/server';

export async function checkAndConsumeQuota(cost: number): Promise<{ success: boolean; error?: string; tokensRemaining?: number }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  // Fetch the profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tokens_remaining, custom_api_key')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    // If profile doesn't exist, create it (fallback if DB trigger didn't fire)
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({ id: user.id, tokens_remaining: 100 })
      .select('tokens_remaining, custom_api_key')
      .single();

    if (createError || !newProfile) {
      return { success: false, error: 'PROFILE_ERROR' };
    }
    
    if (newProfile.custom_api_key) {
      return { success: true, tokensRemaining: newProfile.tokens_remaining };
    }
    
    if (newProfile.tokens_remaining < cost) {
      return { success: false, error: 'OUT_OF_TOKENS', tokensRemaining: newProfile.tokens_remaining };
    }
    
    // Decrement
    await supabase
      .from('profiles')
      .update({ tokens_remaining: newProfile.tokens_remaining - cost })
      .eq('id', user.id);
      
    return { success: true, tokensRemaining: newProfile.tokens_remaining - cost };
  }

  if (profile.custom_api_key) {
    return { success: true, tokensRemaining: profile.tokens_remaining };
  }

  if (profile.tokens_remaining < cost) {
    return { success: false, error: 'OUT_OF_TOKENS', tokensRemaining: profile.tokens_remaining };
  }

  // Decrement
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ tokens_remaining: profile.tokens_remaining - cost })
    .eq('id', user.id);

  if (updateError) {
    return { success: false, error: 'UPDATE_ERROR' };
  }

  return { success: true, tokensRemaining: profile.tokens_remaining - cost };
}
