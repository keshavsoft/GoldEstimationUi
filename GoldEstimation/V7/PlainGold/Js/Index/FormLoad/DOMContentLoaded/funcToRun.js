import { StartFunc as StartFuncFromFetchAsGet } from "./FetchAsGet/entryFile.js";
import { StartFunc as StartFuncFromFetchAsGetForUsd } from "./FetchAsGetForUsd/entryFile.js";

const StartFunc = () => {
    StartFuncFromFetchAsGet();
    StartFuncFromFetchAsGetForUsd();
    (function () {
            const weightEl = document.getElementById('weight');
            const purityEl = document.getElementById('purity');
            const rateEl = document.getElementById('rate');
            const makingEl = document.getElementById('making');

            const rateBigEl = document.getElementById('rateBig');
            const basePriceEl = document.getElementById('basePrice');
            const makingPriceEl = document.getElementById('makingPrice');
            const gstPriceEl = document.getElementById('gstPrice');
            const totalPriceEl = document.getElementById('totalPrice');

            function parseNumber(value) {
                if (typeof value === 'number') return value;
                if (!value) return 0;
                return parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;
            }

            function formatINR(value) {
                return '₹' + (Number(value) || 0).toLocaleString('en-IN', {maximumFractionDigits:2});
            }

            // Determine initial base (24K) rate from the current rate input and current purity
            let baseRate = (function initBaseRate() {
                const currentRate = parseNumber(rateEl.value) || parseNumber(rateBigEl.textContent);
                const currentPurity = parseNumber(purityEl.value) || 1;
                if (currentPurity === 0) return currentRate;
                return currentRate / currentPurity;
            })();

            // Fetch live base rate (24K) from the known endpoint and refresh periodically
            async function fetchBaseRate() {
                try {
                    const url = 'https://bcast.svbcgold.in:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/svbc';
                    const resp = await fetch(url, { method: 'GET', redirect: 'follow' });
                    const contentType = resp.headers.get('Content-Type') || '';

                    if (resp.status !== 200) return;

                    if (contentType.includes('text')) {
                        const txt = await resp.text();
                        const lines = txt.split('\n');
                        // Try to mirror existing parsing from other versions
                        if (lines.length > 8) {
                            const cols = lines[8].split('\t');
                            const candidate = cols[3] || cols[cols.length - 1];
                            const parsed = parseNumber(candidate);
                            if (parsed > 0) {
                                baseRate = parsed;
                                updateRateFromPurity();
                                calculate();
                                return;
                            }
                        }
                        // fallback: extract first number from text
                        const m = txt.match(/\d+(?:\.\d+)?/);
                        if (m) {
                            const parsed = parseNumber(m[0]);
                            if (parsed > 0) {
                                baseRate = parsed;
                                updateRateFromPurity();
                                calculate();
                                return;
                            }
                        }
                    } else {
                        // try json
                        const j = await resp.json();
                        // try common keys or first number in JSON string
                        if (j) {
                            if (typeof j === 'object') {
                                const vals = JSON.stringify(j).match(/\d+(?:\.\d+)?/g);
                                if (vals && vals.length) {
                                    const parsed = parseNumber(vals[0]);
                                    if (parsed > 0) {
                                        baseRate = parsed;
                                        updateRateFromPurity();
                                        calculate();
                                        return;
                                    }
                                }
                            }
                        }
                    }
                } catch (error) {
                    // silent fail — network/CORS may block from file:// preview
                    console.warn('fetchBaseRate error', error);
                }
            }

            // Refresh every 30s
            fetchBaseRate();
            setInterval(fetchBaseRate, 30000);

            function updateRateDisplay(rate) {
                rateEl.value = Number(rate).toFixed(2);
                rateBigEl.textContent = formatINR(rate);
            }

            function updateRateFromPurity() {
                const purity = parseNumber(purityEl.value) || 1;
                const newRate = baseRate * purity;
                updateRateDisplay(newRate);
            }

            function calculate() {
                const weight = parseNumber(weightEl.value);
                const ratePerGram = parseNumber(rateEl.value);
                const makingPercent = parseNumber(makingEl.value);

                const basePrice = weight * ratePerGram;
                const makingPrice = basePrice * (makingPercent / 100);
                const gstPrice = (basePrice + makingPrice) * 0.03; // 3% GST
                const total = basePrice + makingPrice + gstPrice;

                basePriceEl.textContent = formatINR(basePrice);
                makingPriceEl.textContent = formatINR(makingPrice);
                gstPriceEl.textContent = formatINR(gstPrice);
                totalPriceEl.textContent = formatINR(total);
            }

            // Event listeners
            purityEl.addEventListener('change', function () {
                updateRateFromPurity();
                calculate();
            });

            // rate input is auto-updated from baseRate * purity; manual edit disabled

            weightEl.addEventListener('input', calculate);
            makingEl.addEventListener('input', calculate);

            // initialize UI
            updateRateFromPurity();
            calculate();
        })();
};

export { StartFunc };
