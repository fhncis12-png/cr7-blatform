import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
    if (!apiKey) {
      throw new Error('NOWPAYMENTS_API_KEY is not configured');
    }

    // Fetch available currencies
    const currenciesResponse = await fetch(`${NOWPAYMENTS_API_URL}/currencies`, {
      headers: {
        'x-api-key': apiKey,
      },
    });

    if (!currenciesResponse.ok) {
      const errorText = await currenciesResponse.text();
      throw new Error(`Failed to fetch currencies: ${currenciesResponse.status} - ${errorText}`);
    }

    const currenciesData = await currenciesResponse.json();

    // Fetch minimum payment amounts
    const minAmountsResponse = await fetch(`${NOWPAYMENTS_API_URL}/min-amount?currency_from=usd`, {
      headers: {
        'x-api-key': apiKey,
      },
    });

let minAmounts: Record<string, number> = {};
    if (minAmountsResponse.ok) {
      minAmounts = await minAmountsResponse.json();
    }

    // Get estimated fees for popular currencies
    const popularCurrencies = ['btc', 'eth', 'usdt', 'trx', 'ltc', 'xrp', 'bnb', 'sol'];
    const currencyDetails: Array<{
      currency: string;
      name: string;
      network: string;
      minAmount: number;
      isPopular: boolean;
      estimatedFee?: string;
    }> = [];

    // Map currency codes to display names and networks
    const currencyMap: Record<string, { name: string; network: string }> = {
      'btc': { name: 'Bitcoin', network: 'Bitcoin' },
      'eth': { name: 'Ethereum', network: 'ERC20' },
      'usdt': { name: 'Tether', network: 'ERC20' },
      'usdttrc20': { name: 'Tether', network: 'TRC20' },
      'usdtbsc': { name: 'Tether', network: 'BEP20' },
      'usdtsol': { name: 'Tether', network: 'Solana' },
      'trx': { name: 'TRON', network: 'TRC20' },
      'ltc': { name: 'Litecoin', network: 'Litecoin' },
      'xrp': { name: 'Ripple', network: 'XRP Ledger' },
      'bnb': { name: 'BNB', network: 'BEP20' },
      'sol': { name: 'Solana', network: 'Solana' },
      'doge': { name: 'Dogecoin', network: 'Dogecoin' },
      'matic': { name: 'Polygon', network: 'Polygon' },
      'ada': { name: 'Cardano', network: 'Cardano' },
    };

    for (const currency of currenciesData.currencies || []) {
      const currencyLower = currency.toLowerCase();
      const info = currencyMap[currencyLower] || { 
        name: currency.toUpperCase(), 
        network: 'Native' 
      };

      currencyDetails.push({
        currency: currency,
        name: info.name,
        network: info.network,
        minAmount: minAmounts[currency] || 0,
        isPopular: popularCurrencies.includes(currencyLower) || currencyLower.includes('usdt'),
      });
    }

    // Sort: popular first, then alphabetically
    currencyDetails.sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return a.name.localeCompare(b.name);
    });

    return new Response(
      JSON.stringify({
        success: true,
        currencies: currencyDetails,
        minimumDepositUsd: 4,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
