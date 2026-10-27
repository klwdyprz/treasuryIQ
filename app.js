/* ---------- pdf file datas imported ---------- */
const $ = (s) => document.querySelector(s),
  f = (n) => Math.round(n).toLocaleString("en-US"),
  usd = (n) => "$" + f(n);
const money = (n) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const ic = (p) =>
  `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

const php = (n) => "₱" + money(n),
  phK = (n) => "₱" + f(n),
  ASOF = "2026-09-08";
const L = [
  [
    "2026-08-01",
    "Borja, Dayao and Torres Jr. each invest ₱1,000,000",
    "Owner’s capital",
    3000000,
    0,
  ],
  [
    "2026-08-01",
    "Doronila contributes a commercial space",
    "Non-cash capital contribution",
    0,
    0,
  ],
  [
    "2026-08-03",
    "SEC registration (partnership)",
    "Taxes & licenses",
    0,
    15000,
  ],
  [
    "2026-08-04",
    "Barangay clearance and Mayor’s business permit",
    "Taxes & licenses",
    0,
    10500,
  ],
  [
    "2026-08-05",
    "BIR registration, signage and occupational permits",
    "Taxes & licenses",
    0,
    3000,
  ],
  [
    "2026-08-05",
    "Fire safety certificate and sanitary/health permit",
    "Taxes & licenses",
    0,
    4000,
  ],
  ["2026-08-06", "Locational/zoning clearance", "Taxes & licenses", 0, 2000],
  [
    "2026-08-07",
    "Store shelves and display racks (renovation)",
    "Construction expense",
    0,
    365000,
  ],
  [
    "2026-08-08",
    "Initial inventory: construction materials",
    "Merchandise inventory",
    0,
    180000,
  ],
  [
    "2026-08-09",
    "Initial inventory: plumbing supplies",
    "Merchandise inventory",
    0,
    120000,
  ],
  ["2026-08-10", "Business insurance", "Insurance expense", 0, 30000],
  [
    "2026-08-11",
    "Working capital loan from ABC Bank (1 year, paid monthly)",
    "Working capital loan",
    500000,
    0,
  ],
  [
    "2026-08-12",
    "Computers, POS system and office equipment",
    "Office equipment",
    0,
    60000,
  ],
  [
    "2026-08-13",
    "Initial inventory: electrical supplies",
    "Merchandise inventory",
    0,
    300000,
  ],
  [
    "2026-08-14",
    "Initial inventory: tools and accessories",
    "Merchandise inventory",
    0,
    200000,
  ],
  ["2026-08-15", "Office supplies", "Supplies & administrative", 0, 8000],
  ["2026-08-16", "Meralco connection fee", "Operating expense", 0, 5000],
  [
    "2026-08-17",
    "50% advance on ₱76,800 order, Domingo & Yusorez Builders",
    "Cash deposits",
    38400,
    0,
  ],
  [
    "2026-08-18",
    "Second-hand 6-wheeler dump truck for delivery",
    "Vehicles",
    0,
    1000000,
  ],
  [
    "2026-08-19",
    "Additional store shelves and display racks",
    "Furniture & fixtures",
    0,
    30000,
  ],
  ["2026-08-20", "Cash register / POS machine", "Store equipment", 0, 10000],
  [
    "2026-08-21",
    "Advertising and promotion",
    "Advertising & promotion",
    0,
    8000,
  ],
  ["2026-08-22", "PrimeWater connection fee", "Operating expense", 0, 2000],
  ["2026-08-23", "Internet installation fee", "Operating expense", 0, 1400],
  ["2026-08-23", "Fuel for business operations", "Operating expense", 0, 2500],
  [
    "2026-08-24",
    "Initial inventory: tools, paint and hardware accessories",
    "Merchandise inventory",
    0,
    350000,
  ],
  [
    "2026-08-25",
    "Food and refreshments for opening-day guests",
    "Food & refreshments",
    0,
    5000,
  ],
  [
    "2026-08-26",
    "Priest honorarium for store blessing",
    "Representation / donation",
    0,
    3000,
  ],
  [
    "2026-08-27",
    "Tarpaulin, banners and opening decorations",
    "Advertising & promotion",
    0,
    1500,
  ],
  ["2026-08-28", "Cash sale of materials", "Sales revenue", 32400, 0],
  ["2026-08-29", "Cash sale of materials", "Sales revenue", 28900, 0],
  [
    "2026-08-30",
    "Domingo & Yusorez paid the other 50% on delivery",
    "Sales revenue",
    38400,
    0,
  ],
  ["2026-08-31", "Cash sale of materials", "Sales revenue", 31350, 0],
  [
    "2026-09-01",
    "Invoice of ₱13,240 to WaoWao Builders, due end of month",
    "Accounts receivable",
    0,
    0,
  ],
  ["2026-09-02", "Cash sale of materials", "Sales revenue", 29870, 0],
  ["2026-09-03", "Cash sale of materials", "Sales revenue", 24725, 0],
  ["2026-09-04", "Cash sale of materials", "Sales revenue", 30260, 0],
  ["2026-09-05", "WaoWao Builders paid its invoice", "Sales revenue", 13240, 0],
  [
    "2026-09-06",
    "Salaries: 2 utility helpers, 7 days",
    "Salaries & wages",
    0,
    3750,
  ],
  ["2026-09-07", "Salary: 1 sales staff, 7 days", "Salaries & wages", 0, 3750],
  ["2026-09-08", "Holiday pay for August 31", "Salaries & wages", 0, 1607.13],
];
const FC = {
  col: [285450, 265500, 315000, 350000],
  oth: [20000, 10000, 13000, 5000],
  sup: [83400, 76360, 38400, 95600],
  sal: [7500, 7500, 7500, 7500],
  loan: [45833.33, 0, 0, 0],
  exp: [2500, 7678.25, 6149, 2500],
};
const MINC = 300000,
  LOAN = { orig: 500000, pay: 45833.33, bal: 454166.67 };
const INV = [
  { n: "Treasury Bills", amt: 500000, rate: 0.05, mat: "2026-11-30" },
  { n: "Time Deposit", amt: 245037.87, rate: 0.03, mat: "2026-10-01" },
];
const STATED = {
  in: 3767545,
  out: 2725007.13,
  end: 1042537.87,
  end4: 1918067.29,
  inn: 1263950,
  outf: 388420.58,
  loan: 454166.67,
  inv: 745037.87,
};
const sum = (a) => a.reduce((s, x) => s + x, 0),
  cin = () => sum(L.map((r) => r[3])),
  cout = () => sum(L.map((r) => r[4])),
  cashNow = () => cin() - cout();
const daysTo = (d) => Math.round((new Date(d) - new Date(ASOF)) / 864e5);
function fcast(cut = 0, shock = 0) {
  let b = cashNow();
  return [0, 1, 2, 3].map((i) => {
    const col = FC.col[i] * (1 - cut),
      inn = col + FC.oth[i],
      out = FC.sup[i] + FC.sal[i] + FC.loan[i] + FC.exp[i] + (i ? 0 : shock),
      beg = b;
    b = beg + inn - out;
    return {
      beg,
      col,
      oth: FC.oth[i],
      inn,
      sup: FC.sup[i],
      sal: FC.sal[i],
      loan: FC.loan[i],
      exp: FC.exp[i],
      out,
      net: inn - out,
      end: b,
    };
  });
}
const lowest = () => Math.min(cashNow(), ...fcast().map((r) => r.end));
const bycat = () => {
  const m = {};
  L.forEach((r) => {
    if (r[4]) m[r[2]] = (m[r[2]] || 0) + r[4];
  });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
};
const ML = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  dl = (d) => ML[+d.slice(5, 7) - 1] + " " + +d.slice(8);
const fmK = (v) =>
  v >= 1000 ? (v / 1000).toFixed(1) + "M" : Math.round(v) + "K";
const PAY = [
  {
    id: "PAY-W1-LOAN",
    to: "ABC Bank loan installment, Week 1",
    amt: 45833.33,
    s: 2,
  },
  { id: "PAY-W1-SUP", to: "Supplier payments, Week 1", amt: 83400, s: 1 },
  { id: "PAY-W1-SAL", to: "Salaries and wages, Week 1", amt: 7500, s: 0 },
  { id: "PAY-W2-SUP", to: "Supplier payments, Week 2", amt: 76360, s: 0 },
  { id: "PAY-W3-SUP", to: "Supplier payments, Week 3", amt: 38400, s: 0 },
  { id: "PAY-W4-SUP", to: "Supplier payments, Week 4", amt: 95600, s: 0 },
];
const STAGES = ["Created", "Validated", "Approved", "Released", "Confirmed"];
let cut = 0,
  shock = 0,
  range = "Actual",
  recRun = false;

/* ---------- How each function works ---------- */
const INFO = {
  cash: {
    n: "Cash Visibility",
    ic: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    sum: "One updated view of cash across every bank account, entity and currency.",
    flow: [
      [
        "Collect",
        "Bank connectivity",
        "Each bank sends balances and transactions by API, SWIFT message or secure file.",
      ],
      [
        "Consolidate",
        "Treasury management system",
        "Formats are standardized, currencies converted and accounts grouped by entity.",
      ],
      [
        "Present",
        "One cash position",
        "Balances, inflows, outflows and available funds appear together, refreshed during the day.",
      ],
    ],
    purpose: "Show the current consolidated cash position.",
    data: "Bank balances, inflows, outflows, available funds.",
    benefit: "Faster and more accurate cash visibility.",
  },
  pay: {
    n: "Payments",
    ic: '<path d="M4 8h14l-4-4M20 16H6l4 4"/>',
    sum: "A payment hub collects requests, checks them, routes them for approval and sends them to the right bank.",
    flow: [
      [
        "Create",
        "Request enters",
        "Accounts payable, payroll or an intercompany transfer creates a payment file.",
      ],
      [
        "Validate",
        "Automatic checks",
        "Payee details, duplicates, limits and sanctions rules are checked.",
      ],
      [
        "Approve",
        "Digital workflow",
        "Approvers sign off by role and amount limit, with an audit trail.",
      ],
      [
        "Release",
        "Payment hub",
        "One hub converts the payment to each bank’s format and sends it.",
      ],
      [
        "Confirm",
        "Status feedback",
        "Bank acknowledgements mark each payment completed or failed.",
      ],
    ],
    purpose: "Simplify payment processing and reduce manual work.",
    data: "Payment amounts, dates, recipients, statuses.",
    benefit: "Less manual data entry and fewer processing errors.",
  },
  fc: {
    n: "Forecasting",
    ic: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    sum: "Analytics and machine learning find patterns in past cash flows and estimate future inflows, outflows and liquidity needs.",
    flow: [
      [
        "Learn",
        "Historical cash flows",
        "Models study past receipts and payments, seasonality and customer payment behavior.",
      ],
      [
        "Combine",
        "Expected items",
        "Open invoices, payroll dates, tax and debt payments add known future events.",
      ],
      [
        "Project",
        "Forecast and scenarios",
        "The system projects balances and tests what-if cases such as slower collections.",
      ],
      [
        "Improve",
        "Compare to actuals",
        "Each week’s variance helps the model get more accurate.",
      ],
    ],
    purpose: "Estimate future cash inflows, outflows and liquidity needs.",
    data: "Historical cash flows, expected receipts, expenses, projected balances.",
    benefit: "Better financial planning and scenario analysis.",
  },
  risk: {
    n: "Risk Monitoring",
    ic: '<path d="M6 16v-5a6 6 0 0112 0v5l2 2H4zM10 21h4"/>',
    sum: "Market-data feeds and analytics show where currency and interest-rate moves could hurt the company, and alert when a limit is crossed.",
    flow: [
      [
        "Feed",
        "Market data",
        "Live FX and interest rates stream into the treasury system.",
      ],
      [
        "Measure",
        "Exposure",
        "Foreign-currency cash, receivables and payables are added up and netted by currency.",
      ],
      [
        "Test",
        "Analytics",
        "Sensitivity tests show the impact of a rate move.",
      ],
      [
        "Alert",
        "Policy limits",
        "Alerts fire when the hedge ratio or a market move breaks policy.",
      ],
    ],
    purpose: "Detect potential financial risks and support informed decisions.",
    data: "FX rates, interest rates, market movements, exposures.",
    benefit: "Faster identification of potential risks.",
  },
  rec: {
    n: "Reconciliation",
    ic: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
    sum: "Automation matches what the bank says happened with what the books say should have happened, and flags every difference.",
    flow: [
      [
        "Rules",
        "Rules engine",
        "Exact matches on reference, amount and date clear the easy items first.",
      ],
      [
        "Learn",
        "Machine learning",
        "Models suggest matches for items that differ slightly, such as truncated references or fees.",
      ],
      [
        "Act",
        "RPA",
        "Robots post matches to the ledger and open tasks for exceptions.",
      ],
      [
        "Review",
        "Exceptions",
        "People handle only unmatched or low-confidence items.",
      ],
    ],
    purpose: "Verify that records match actual transactions.",
    data: "Bank statements, invoices, payment records, ledger entries.",
    benefit: "Less manual matching and faster detection of discrepancies.",
  },
  rep: {
    n: "Reporting",
    ic: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
    sum: "Dashboards and automated commentary pull results from the other five functions into a form managers can act on.",
    flow: [
      [
        "Gather",
        "Shared data",
        "Cash, payments, forecasts, risk and reconciliation results sit in one data layer.",
      ],
      [
        "Visualize",
        "Dashboards",
        "Charts and KPIs refresh whenever the data changes.",
      ],
      [
        "Explain",
        "Automated commentary",
        "Text is generated from the numbers, so a draft explanation comes with the report.",
      ],
      [
        "Share",
        "Distribution",
        "Reports export to files for management packs and audit.",
      ],
    ],
    purpose: "Present performance and treasury activity clearly.",
    data: "Cash positions, payments, forecasts, risks, reconciliation results.",
    benefit: "Faster reporting and better management decisions.",
  },
};
const ORDER = ["cash", "pay", "fc", "risk", "rec", "rep"];
const GRID =
  '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>';
const SH = ic('<path d="M12 15V4M7 8l5-4 5 4M5 14v5h14v-5"/>') + " Share";

/* ---------- Helpers ---------- */
const seg = (pct, cls = "on", n = 24) =>
  `<div class="seg">${Array.from({ length: n }, (_, i) => `<i class="${i < Math.round(pct * n) ? cls : ""}"></i>`).join("")}</div>`;
const pc = (s) => (s >= 4 ? "p-g" : s >= 2 ? "p-b" : "p-w");
function line(series, labels, o = {}) {
  const w = 640,
    h = o.h || 240,
    pl = 44,
    pr = 8,
    pt = 10,
    pb = 24,
    all = series.flatMap((s) => s.d),
    mn = o.min ?? Math.min(...all) * 0.94,
    mx = o.max ?? Math.max(...all) * 1.04,
    n = series[0].d.length;
  const x = (i) => pl + (i * (w - pl - pr)) / (n - 1),
    y = (v) => h - pb - ((v - mn) / (mx - mn)) * (h - pb - pt),
    fm = o.fmt || ((v) => Math.round(v));
  let s = `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${o.label || "Line chart"}"><defs>${series.map((q, i) => `<linearGradient id="gr${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${q.c}" stop-opacity=".22"/><stop offset="1" stop-color="${q.c}" stop-opacity="0"/></linearGradient>`).join("")}</defs>`;
  for (let k = 0; k < 5; k++) {
    const v = mn + (k * (mx - mn)) / 4,
      yy = y(v);
    s += `<line x1="${pl}" x2="${w - pr}" y1="${yy}" y2="${yy}" stroke="#171a20"/><text x="${pl - 6}" y="${yy + 4}" text-anchor="end">${fm(v)}</text>`;
  }
  series.forEach((q, i) => {
    const p = q.d
      .map((v, j) => `${x(j).toFixed(1)},${y(v).toFixed(1)}`)
      .join(" ");
    s += `<polygon points="${x(0)},${y(mn)} ${p} ${x(n - 1)},${y(mn)}" fill="url(#gr${i})"/><polyline points="${p}" fill="none" stroke="${q.c}" stroke-width="1.8" stroke-linejoin="round"/>`;
  });
  if (o.thr != null) {
    const yy = y(o.thr);
    s += `<line x1="${pl}" x2="${w - pr}" y1="${yy}" y2="${yy}" stroke="#f0b84a" stroke-dasharray="5 4"/><text x="${pl + 4}" y="${yy - 5}" style="fill:#f0b84a">Minimum cash balance</text>`;
  }
  labels.forEach((l, i) => {
    if (l)
      s += `<text x="${x(i)}" y="${h - 6}" text-anchor="middle">${l}</text>`;
  });
  return s + "</svg>";
}
function spark(d, w = 270, h = 56) {
  const mn = Math.min(...d),
    mx = Math.max(...d),
    x = (i) => (i * w) / (d.length - 1),
    y = (v) => h - 4 - ((v - mn) / (mx - mn)) * (h - 10);
  let p = `M${x(0)},${y(d[0])}`;
  for (let i = 1; i < d.length; i++) {
    const c = (x(i - 1) + x(i)) / 2;
    p += ` C${c},${y(d[i - 1])} ${c},${y(d[i])} ${x(i)},${y(d[i])}`;
  }
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Uptime trend"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7bf08e" stop-opacity=".25"/><stop offset="1" stop-color="#7bf08e" stop-opacity="0"/></linearGradient></defs><path d="${p} L${w},${h} L0,${h}Z" fill="url(#sg)"/><path d="${p}" fill="none" stroke="#7bf08e" stroke-width="1.6"/></svg>`;
}
function how(k) {
  const i = INFO[k];
  return `<div class="card"><div class="h">How it works</div><p class="sub">${i.sum}</p><div class="flow">${i.flow.map((s) => `<div class="step"><b>${s[0]}</b><em>${s[1]}</em><p>${s[2]}</p></div>`).join("")}</div></div>
 <div class="card"><div class="trio"><div><b>Purpose</b>${i.purpose}</div><div><b>Financial data</b>${i.data}</div><div><b>Potential benefit</b>${i.benefit}</div></div></div>`;
}

/* ---------- Pages ---------- */
function overview() {
  const R = fcast(),
    ti = sum(R.map((r) => r.inn)),
    to = sum(R.map((r) => r.out)),
    lo = lowest(),
    cov = lo / MINC,
    now = cashNow(),
    ok = lo >= MINC;
  let ser, lab, leg;
  if (range == "Actual") {
    const ds = [...new Set(L.map((r) => r[0]))],
      ci = [],
      co = [];
    let a = 0,
      b = 0;
    ds.forEach((d) => {
      L.filter((r) => r[0] == d).forEach((r) => {
        a += r[3];
        b += r[4];
      });
      ci.push(a / 1000);
      co.push(b / 1000);
    });
    ser = [
      { d: ci, c: "#7bf08e" },
      { d: co, c: "#5ea1f5" },
    ];
    lab = ds.map((d, i) => (i % 6 == 0 ? dl(d) : ""));
    leg = [cin(), cout()];
  } else {
    ser = [
      { d: R.map((r) => r.inn / 1000), c: "#7bf08e" },
      { d: R.map((r) => r.out / 1000), c: "#5ea1f5" },
    ];
    lab = ["W1", "W2", "W3", "W4"];
    leg = [ti, to];
  }
  const last = L.map((r, i) => [r, i])
      .slice(-5)
      .reverse(),
    trend = [now, ...R.map((r) => r.end)];
  return `<div class="cols"><div class="stack">
 <div class="kpis">
  <div class="card"><div class="lbl">Current Cash Balance</div><div class="big">${php(now)}</div><div class="sub">Cash in minus cash out to date</div>
   <div class="cur"><span class="hl">Cash in <b>${phK(cin())}</b></span><span>Cash out <b>${phK(cout())}</b></span><span>Loans <b>${phK(LOAN.bal)}</b></span><span>Investments <b>${phK(sum(INV.map((i) => i.amt)))}</b></span></div></div>
  <div class="card"><div class="lbl">Expected Cash Inflows</div><div class="big">${php(ti)}</div><div class="sub">Next 4 weeks, vs ${php(to)} out</div>
   <div class="lines">${R.map((r, i) => `<span>Week ${i + 1} · ${php(r.inn)}</span>`).join("")}</div></div>
  <div class="card"><div class="lbl">Minimum Cash Coverage</div><div class="big">${(cov * 100).toFixed(1)}%</div>${seg(Math.min(cov, 1), ok ? "on" : "wn")}<div class="sub">Lowest balance ${php(lo)} vs the ${phK(MINC)} minimum in company policy</div></div>
 </div>
 <div class="card"><div class="row"><div><div class="h">Cash Flow Volume</div><div class="sub">${range == "Actual" ? "Cumulative cash in and cash out, Aug 1 to Sep 8" : "Weekly cash in and cash out forecast"}</div></div>
  <div class="tabs">${["Actual", "Forecast"].map((r) => `<button class="${r == range ? "on" : ""}" onclick="range='${r}';go()">${r}</button>`).join("")}</div></div>
  <div class="leg"><span><i style="background:var(--g)"></i>Cash in ₱${fmK(leg[0] / 1000)}</span><span><i style="background:var(--b)"></i>Cash out ₱${fmK(leg[1] / 1000)}</span></div>
  ${line(ser, lab, { min: 0, fmt: fmK, label: "Cash in and cash out" })}</div>
 <div class="card"><div class="row"><div class="h">Latest Transactions</div><a class="btn" href="#cash">See All</a></div>
  <table><tr><th>ID</th><th>Description</th><th>Type</th><th class="n">Amount</th></tr>
  ${last
    .map(([r, i]) => {
      const t = r[3]
        ? ["Cash in", "p-g"]
        : r[4]
          ? ["Cash out", "p-b"]
          : ["Non-cash", "p-w"];
      return `<tr><td class="sub">TXN-${String(i + 1).padStart(3, "0")}</td><td>${r[1]}</td><td><span class="pill ${t[1]}">${t[0]}</span></td><td class="n">${php(r[3] || r[4])}</td></tr>`;
    })
    .join("")}</table></div>
 </div><div class="stack">
 <div class="card"><div class="row"><div class="h">Treasury Health</div><span class="ok">${ok ? "Within policy" : "Review needed"}</span></div>
  <div class="row mt"><span class="lbl">Projected cash trend</span><b class="h">₱${fmK(R[3].end / 1000)}</b></div>${spark(trend)}
  <div class="row mt"><span class="lbl">Loan-to-cash ratio</span><b class="h">${((LOAN.bal / now) * 100).toFixed(1)}%</b></div>${seg(Math.min(LOAN.bal / now, 1), "bl", 30)}<div class="sub n">Lower means less debt per peso of cash</div>
  <div class="row mt"><span class="lbl">Outflows as share of inflows</span><b class="h">${((to / ti) * 100).toFixed(1)}%</b></div>${seg(to / ti, "on", 30)}
  <div class="row mt"><span class="lbl">Risk monitoring</span><a class="link" href="#risk">Open →</a></div></div>
 <div class="card"><div class="h">Investments and Loans</div>
  <table class="sm mt"><tr><th>Item</th><th class="n">Amount</th><th class="n">Rate</th><th class="n">Matures</th></tr>
  ${INV.map((i) => `<tr><td>${i.n}</td><td class="n">${phK(i.amt)}</td><td class="n">${(i.rate * 100).toFixed(2)}%</td><td class="n">${dl(i.mat)}</td></tr>`).join("")}</table>
  <div class="callout">Working capital loan: ${php(LOAN.bal)} outstanding of ${phK(LOAN.orig)}, paid ${php(LOAN.pay)} a month.</div></div>
 </div></div>`;
}

function cash() {
  const cats = bycat(),
    co = cout(),
    top = cats.slice(0, 6),
    rest = co - sum(top.map((c) => c[1]));
  return `<div class="stack"><div class="g2">
 <div class="card"><div class="h">Cash position, Aug 1 to Sep 8, 2026</div><table class="sm mt">
 ${[
   ["Beginning cash balance", 0],
   ["Total cash in", cin()],
   ["Total cash out", cout()],
   ["Net cash flow", cashNow()],
   ["Ending cash balance", cashNow()],
 ]
   .map(
     (r, i) =>
       `<tr><td>${i == 4 ? "<b>" + r[0] + "</b>" : r[0]}</td><td class="n">${i == 4 ? "<b>" + php(r[1]) + "</b>" : php(r[1])}</td></tr>`,
   )
   .join("")}</table></div>
 <div class="card"><div class="h">Where the cash went</div>${[...top, ["All other categories", rest]].map((c) => `<div class="row mt"><span>${c[0]}</span><span class="sub">${phK(c[1])} (${Math.round((c[1] / co) * 100)}%)</span></div>${seg(c[1] / co, "bl", 30)}`).join("")}</div></div>
 <div class="card"><div class="h">Cash transactions</div><div class="sc"><table><tr><th>Date</th><th>Description</th><th>Category</th><th class="n">Cash in</th><th class="n">Cash out</th></tr>
 ${L.map((r) => `<tr><td class="sub">${dl(r[0])}</td><td>${r[1]}</td><td class="sub">${r[2]}</td><td class="n" style="color:var(--g)">${r[3] ? php(r[3]) : ""}</td><td class="n">${r[4] ? php(r[4]) : ""}</td></tr>`).join("")}</table></div></div>${how("cash")}</div>`;
}

function pay() {
  const R = fcast();
  return `<div class="stack"><div class="card"><div class="row"><div class="h">Payment queue (from the forecast)</div><span class="sub">Press Advance to move a payment to its next stage</span></div>
 <table><tr><th>ID</th><th>Payee</th><th class="n">Amount</th><th>Stage</th><th></th></tr>
 ${PAY.map(
   (
     p,
     i,
   ) => `<tr><td class="sub">${p.id}</td><td>${p.to}</td><td class="n">${php(p.amt)}</td><td><span class="pill ${pc(p.s)}">${STAGES[p.s]}</span></td>
 <td class="n">${p.s < 4 ? `<button class="btn" onclick="PAY[${i}].s++;go()">Advance</button>` : `<span class="sub">Done</span>`}</td></tr>`,
 ).join("")}</table>
 <div class="callout">Every payment passes the same stages: ${STAGES.join(", ")}. Nobody re-types a payment into a bank portal.</div></div>
 <div class="card"><div class="h">Scheduled cash outflows</div><table class="sm mt"><tr><th></th><th class="n">Suppliers</th><th class="n">Salaries</th><th class="n">Loan</th><th class="n">Other</th><th class="n">Total</th></tr>
 ${R.map((r, i) => `<tr><td>Week ${i + 1}</td><td class="n">${php(r.sup)}</td><td class="n">${php(r.sal)}</td><td class="n">${php(r.loan)}</td><td class="n">${php(r.exp)}</td><td class="n"><b>${php(r.out)}</b></td></tr>`).join("")}</table></div>${how("pay")}</div>`;
}

const FT = [
  ["Beginning cash balance", "beg"],
  ["Expected cash collections", "col"],
  ["Other cash inflows", "oth"],
  ["Total cash inflows", "inn"],
  ["Supplier payments", "sup"],
  ["Salaries and wages", "sal"],
  ["Loan payments", "loan"],
  ["Other expenses", "exp"],
  ["Total cash outflows", "out"],
  ["Net cash flow", "net"],
  ["Ending cash balance", "end"],
];
function fcDyn() {
  const R = fcast(cut),
    mn = Math.min(...R.map((r) => r.end)),
    bold = (k) => ["inn", "out", "net", "end"].includes(k);
  return `${line([{ d: [cashNow(), ...R.map((r) => r.end)], c: cut ? "#f0b84a" : "#7bf08e" }], ["Now", "W1", "W2", "W3", "W4"], { h: 240, thr: MINC, min: Math.min(mn, MINC) * 0.9, max: Math.max(...R.map((r) => r.end)) * 1.04, fmt: (v) => "₱" + fmK(v / 1000), label: "Cash forecast" })}
 <div class="callout ${mn < MINC ? "bad" : ""}">${mn < MINC ? `Warning: cash drops to ${php(mn)}, below the ${phK(MINC)} minimum.` : `Lowest projected balance is ${php(mn)}, ${php(mn - MINC)} above the ${phK(MINC)} minimum cash balance.`}</div>
 <table class="sm mt"><tr><th></th>${R.map((r, i) => `<th class="n">Week ${i + 1}</th>`).join("")}</tr>
 ${FT.map(([n, k]) => `<tr><td>${bold(k) ? "<b>" + n + "</b>" : n}</td>${R.map((r) => `<td class="n">${bold(k) ? "<b>" + php(r[k]) + "</b>" : php(r[k])}</td>`).join("")}</tr>`).join("")}</table>`;
}
function fc() {
  return `<div class="stack"><div class="card"><div class="h">What if customers pay less than expected?</div><div class="sub">Expected collections come in <b id="sl" style="color:var(--ink)">${Math.round(cut * 100)}% lower</b></div>
 <input type="range" min="0" max="100" step="5" value="${Math.round(cut * 100)}" oninput="cut=+this.value/100;$('#sl').textContent=this.value+'% lower';$('#dyn').innerHTML=fcDyn()" aria-label="Collections shortfall in percent"></div>
 <div class="card"><div class="h">Four-week cash forecast</div><div id="dyn">${fcDyn()}</div></div>${how("fc")}</div>`;
}

function riskDyn() {
  const mn = Math.min(...fcast(0, shock).map((r) => r.end)),
    room = Math.min(...fcast().map((r) => r.end)) - MINC;
  return `<div class="big" style="color:${mn < MINC ? "var(--r)" : "var(--g)"}">${php(mn)}</div><div class="sub">Lowest projected balance over four weeks</div>
 <div class="callout ${mn < MINC ? "bad" : ""}">${mn < MINC ? `This shock breaks the ${phK(MINC)} minimum cash policy.` : `Still above the ${phK(MINC)} minimum.`} Cash can absorb a one-time shock of up to ${php(room)} before breaching policy.</div>`;
}
function risk() {
  const R = fcast(),
    now = cashNow();
  return `<div class="stack"><div class="card"><div class="h">Stress test: an unexpected cash shock in Week 1</div><div class="sub">One-time payment of <b id="sl" style="color:var(--ink)">${phK(shock)}</b></div>
 <input type="range" min="0" max="1500000" step="50000" value="${shock}" oninput="shock=+this.value;$('#sl').textContent='₱'+f(shock);$('#dyn').innerHTML=riskDyn()" aria-label="Cash shock amount"><div id="dyn">${riskDyn()}</div></div>
 <div class="g2"><div class="card"><div class="h">Minimum cash policy (${phK(MINC)})</div><table class="sm mt"><tr><th>Week</th><th class="n">Ending cash</th><th class="n">Headroom</th><th>Status</th></tr>
 ${R.map((r, i) => `<tr><td>Week ${i + 1}</td><td class="n">${php(r.end)}</td><td class="n">${php(r.end - MINC)}</td><td><span class="pill ${r.end < MINC ? "p-r" : "p-g"}">${r.end < MINC ? "Below" : "Within"}</span></td></tr>`).join("")}</table></div>
 <div class="card"><div class="h">Debt and maturities</div><div class="sub mt">Loan-to-cash ratio</div><div class="big">${((LOAN.bal / now) * 100).toFixed(1)}%</div><div class="sub">${php(LOAN.bal)} owed against ${php(now)} cash</div>
 <table class="sm mt"><tr><th>Investment</th><th class="n">Matures</th><th class="n">Est. yearly interest</th></tr>
 ${INV.map((i) => {
   const d = daysTo(i.mat);
   return `<tr><td>${i.n}<br><span class="pill ${d <= 30 ? "p-w" : "p-g"}">${d} days left</span></td><td class="n">${dl(i.mat)}</td><td class="n">${php(i.amt * i.rate)}</td></tr>`;
 }).join("")}</table></div></div>${how("risk")}</div>`;
}

function chk() {
  const R = fcast(),
    A = (a, b, n) => [n, a, b];
  return [
    A(cin(), STATED.in, "Total cash in: ledger vs workbook"),
    A(cout(), STATED.out, "Total cash out: ledger vs workbook"),
    A(cashNow(), STATED.end, "Ending cash vs forecast Week 1 start"),
    A(R[3].end, STATED.end4, "Week 4 ending cash vs dashboard"),
    A(sum(R.map((r) => r.inn)), STATED.inn, "Four-week inflows vs dashboard"),
    A(sum(R.map((r) => r.out)), STATED.outf, "Four-week outflows vs dashboard"),
    A(
      LOAN.orig - LOAN.pay,
      STATED.loan,
      "Loan balance: original minus payment",
    ),
    A(sum(INV.map((i) => i.amt)), STATED.inv, "Total investments vs dashboard"),
    A(LOAN.pay, LOAN.orig / 12, "Loan installment vs principal ÷ 12"),
  ];
}
function rec() {
  const C = chk(),
    res = C.map((c) =>
      !recRun
        ? ["Unchecked", ""]
        : Math.abs(c[1] - c[2]) < 0.005
          ? ["Matched", "p-g"]
          : ["Differs by " + php(Math.abs(c[1] - c[2])), "p-w"],
    ),
    ok = res.filter((r) => r[0] == "Matched").length;
  return `<div class="stack"><div class="card"><div class="row"><div class="h">Cross-checks between workbook sheets</div><button class="btn pri" onclick="recRun=!recRun;go()">${recRun ? "Reset" : "Run auto-match"}</button></div>
 <table class="mt"><tr><th>Check</th><th class="n">Calculated</th><th class="n">Workbook</th><th>Result</th></tr>
 ${C.map((c, i) => `<tr><td>${c[0]}</td><td class="n">${php(c[1])}</td><td class="n">${php(c[2])}</td><td><span class="pill ${res[i][1]}">${res[i][0]}</span></td></tr>`).join("")}</table>
 <div class="callout">${recRun ? `${ok} of ${C.length} checks matched automatically. The ${C.length - ok} left over go to a person: the monthly installment is ₱4,166.66 above one-twelfth of the principal, which is likely interest.` : "Nothing checked yet. Run the auto-match to compare the sheets."}</div></div>${how("rec")}</div>`;
}

function csv() {
  const t = [
      "Date,Description,Category,Cash in,Cash out",
      ...L.map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n"),
    a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([t], { type: "text/csv" }));
  a.download = "cash-transactions.csv";
  a.click();
}
function rep() {
  const R = fcast(),
    ti = sum(R.map((r) => r.inn)),
    to = sum(R.map((r) => r.out)),
    now = cashNow(),
    inv = sum(INV.map((i) => i.amt)),
    td = INV[1];
  return `<div class="stack"><div class="kpis">
 <div class="card"><div class="lbl">Current cash balance</div><div class="big">${php(now)}</div></div>
 <div class="card"><div class="lbl">Projected ending cash</div><div class="big">${php(R[3].end)}</div></div>
 <div class="card"><div class="lbl">Outstanding loans</div><div class="big">${php(LOAN.bal)}</div></div></div>
 <div class="g2"><div class="card"><div class="row"><div class="h">Treasury dashboard</div><button class="btn" onclick="csv()">Download transactions (CSV)</button></div><table class="sm mt">
 ${[
   ["Current cash balance", now],
   ["Total expected cash inflows", ti],
   ["Total expected cash outflows", to],
   ["Projected ending cash balance", R[3].end],
   ["Total outstanding loans", LOAN.bal],
   ["Total investments", inv],
 ]
   .map((r) => `<tr><td>${r[0]}</td><td class="n">${php(r[1])}</td></tr>`)
   .join("")}</table></div>
 <div class="card"><div class="h">Automated commentary</div><p class="mt">Aqua Defense Construction Inc. holds ${php(now)} in cash after receiving ${php(cin())} and paying out ${php(cout())} between Aug 1 and Sep 8, 2026. The next four weeks bring ${php(ti)} in and ${php(to)} out, lifting cash to ${php(R[3].end)} by Week 4. The lowest balance stays ${php(lowest() - MINC)} above the ${phK(MINC)} minimum. ${php(LOAN.bal)} is still owed on the working capital loan, and ${php(inv)} sits in investments; the ${td.n} matures ${daysTo(td.mat)} days after the data date.</p>
 <div class="callout">This text is written by the system from the numbers on the other pages. Change a number and it changes here.</div></div></div>${how("rep")}</div>`;
}

/* ---------- Router ---------- */
const PAGES = { overview, cash, pay, fc, risk, rec, rep };
function share(b) {
  navigator.clipboard && navigator.clipboard.writeText(location.href);
  b.textContent = "Link copied";
  setTimeout(() => (b.innerHTML = SH), 1500);
}
function go() {
  const id = PAGES[location.hash.slice(1)]
      ? location.hash.slice(1)
      : "overview",
    i = INFO[id],
    name = i ? i.n : "Treasury Overview";
  $("#ttl").textContent = name;
  $("#date").textContent = "As of September 8, 2026";
  $("#view").innerHTML = PAGES[id]();
  const link = (k, n, p) =>
    `<a class="ico ${id == k ? "on" : ""}" href="#${k}" data-tip="${n}" aria-label="${n}" ${id == k ? 'aria-current="page"' : ""}>${ic(p)}</a>`;
  $("#nav").innerHTML =
    link("overview", "Treasury Overview", GRID) +
    ORDER.map((k) => link(k, INFO[k].n, INFO[k].ic)).join("");
  document.title = name + " | TreasuryIQ";
}
$("#share").innerHTML = SH;
window.addEventListener("hashchange", () => {
  go();
  window.scrollTo(0, 0);
});
go();
