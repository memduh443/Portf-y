export default async function handler(req: any, res: any) {

  // CORS

  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {

    return res.status(200).end();

  }

  if (req.method !== 'POST') {

    return res.status(405).json({

      error: 'Only POST requests are allowed',

    });

  }

  try {

    const body = req.body || {};

    const assets = Array.isArray(body.assets) ? body.assets : [];

    const watchlist = Array.isArray(body.watchlist)

      ? body.watchlist

      : [];

    const allItems = [...assets, ...watchlist];

    const symbols = [

      ...new Set(

        allItems

          .map((item: any) => {

            const symbol = String(item.symbol || '')

              .trim()

              .toUpperCase();

            const category = String(item.category || '')

              .toLowerCase();

            if (!symbol) return null;

            // Euro / döviz

            if (

              category.includes('döviz') ||

              category.includes('doviz') ||

              category.includes('currency') ||

              symbol === 'EURTRY'

            ) {

              return 'EURTRY=X';

            }

            // Altın

            if (

              category.includes('altın') ||

              category.includes('altin') ||

              category.includes('gold')

            ) {

              return 'GC=F';

            }

            // Kripto

            if (

              category.includes('kripto') ||

              category.includes('crypto')

            ) {

              if (symbol.includes('-')) {

                return symbol;

              }

              return `${symbol}-USD`;

            }

            // BIST

            if (

              category.includes('bist') ||

              category.includes('hisse') ||

              category.includes('stock')

            ) {

              if (symbol.endsWith('.IS')) {

                return symbol;

              }

              return `${symbol}.IS`;

            }

            // Diğer semboller

            return symbol;

          })

          .filter(Boolean),

      ),

    ];

    const prices: Record<string, any> = {};

    await Promise.all(

      symbols.map(async (yahooSymbol: string) => {

        try {

          const url =

            `https://query1.finance.yahoo.com/v8/finance/chart/` +

            `${encodeURIComponent(yahooSymbol)}` +

            `?range=1d&interval=1m`;

          const response = await fetch(url, {

            headers: {

              'User-Agent': 'Mozilla/5.0',

            },

          });

          if (!response.ok) {

            console.error(

              `Yahoo fiyat hatası ${yahooSymbol}:`,

              response.status,

            );

            return;

          }

          const json = await response.json();

          const result = json?.chart?.result?.[0];

          if (!result) return;

          const meta = result.meta;

          const price =

            meta?.regularMarketPrice ??

            meta?.previousClose;

          const previousClose =

            meta?.previousClose ??

            meta?.chartPreviousClose;

          if (

            typeof price !== 'number' ||

            !Number.isFinite(price)

          ) {

            return;

          }

          let changePercent = 0;

          if (

            typeof previousClose === 'number' &&

            previousClose !== 0

          ) {

            changePercent =

              ((price - previousClose) / previousClose) * 100;

          }

          // Uygulamadaki sembole geri dön

          let appSymbol = yahooSymbol;

          if (yahooSymbol === 'EURTRY=X') {

            appSymbol = 'EURTRY';

          } else if (yahooSymbol === 'GC=F') {

            appSymbol = 'GOLD';

          } else if (yahooSymbol.endsWith('.IS')) {

            appSymbol = yahooSymbol.replace('.IS', '');

          } else if (yahooSymbol.endsWith('-USD')) {

            appSymbol = yahooSymbol.replace('-USD', '');

          }

          prices[appSymbol.toUpperCase()] = {

            price,

            changePercent,

            currency: meta?.currency || null,

            marketState: meta?.marketState || null,

            updatedAt: Date.now(),

          };

        } catch (error) {

          console.error(

            `Fiyat alınamadı: ${yahooSymbol}`,

            error,

          );

        }

      }),

    );

    return res.status(200).json({

      success: true,

      prices,

      updatedAt: Date.now(),

    });

  } catch (error) {

    console.error('Market prices API error:', error);

    return res.status(500).json({

      success: false,

      error: 'Market prices could not be fetched',

    });

  }

}
