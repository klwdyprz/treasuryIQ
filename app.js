/* TreasuryIQ. Data lives in Supabase when config.js has keys, otherwise in this browser (demo mode). */
const $ = (s) => document.querySelector(s),
  f = (n) => Math.round(n).toLocaleString("en-US");
const money = (n) =>
  (+n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const php = (n) => "₱" + money(n),
  phK = (n) => "₱" + f(n),
  num = (v) => +v || 0,
  sum = (a) => a.reduce((s, x) => s + x, 0);
const esc = (s) =>
  String(s == null ? "" : s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const ic = (p) =>
  `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const today = () => new Date().toLocaleDateString("en-CA"),
  daysTo = (d) => Math.round((new Date(d) - new Date(today())) / 864e5);
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
  dl = (d) => (d ? ML[+d.slice(5, 7) - 1] + " " + +d.slice(8) : "");
const fmK = (v) =>
  v >= 1000 ? (v / 1000).toFixed(1) + "M" : Math.round(v) + "K";
const STAGES = ["Created", "Validated", "Approved", "Released", "Confirmed"];
const PAL = [
  "#00c98d",
  "#3d5fb5",
  "#6d9cff",
  "#ff4a1c",
  "#f5b301",
  "#1f2e54",
  "#009e72",
];

/* ---------- Data layer ---------- */
const cfg = window.TIQ_CONFIG || {},
  sb =
    cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase
      ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)
      : null;
let USER = null,
  authMode = "login",
  recovering = false;
const T = [
  "transactions",
  "forecast",
  "loans",
  "investments",
  "payments",
  "bank_items",
];
const D = {
  transactions: [],
  forecast: [],
  loans: [],
  investments: [],
  payments: [],
  bank_items: [],
  settings: { company: "My Company", beginning_cash: 0, min_cash: 300000 },
};
const save = () => localStorage.setItem("tiq", JSON.stringify(D));
function note(m) {
  const t = $("#toast");
  t.textContent = m;
  t.style.display = "block";
  clearTimeout(note.t);
  note.t = setTimeout(() => (t.style.display = "none"), 6000);
}
async function load() {
  if (!sb) {
    try {
      const s = localStorage.getItem("tiq");
      if (s) Object.assign(D, JSON.parse(s));
    } catch (e) {}
    return;
  }
  const {
    data: { session },
  } = await sb.auth.getSession();
  USER = session ? session.user : null;
  if (!USER) return;
  for (const t of T) {
    const { data, error } = await sb.from(t).select("*");
    if (error) note("Database error (" + t + "): " + error.message);
    else D[t] = data;
  }
  const { data } = await sb
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (data) D.settings = data;
}
async function ins(t, row) {
  if (sb) {
    const { data, error } = await sb.from(t).insert(row).select().single();
    if (error) return note(error.message);
    D[t].push(data);
  } else {
    row.id = Date.now() + Math.random();
    D[t].push(row);
    save();
  }
}
async function bulk(t, rows) {
  if (sb) {
    const { data, error } = await sb.from(t).insert(rows).select();
    if (error) return note(error.message);
    D[t].push(...data);
  } else {
    rows.forEach((r, i) => (r.id = Date.now() + i + Math.random()));
    D[t].push(...rows);
    save();
  }
}
async function upd(t, id, p) {
  const r = D[t].find((x) => x.id == id);
  Object.assign(r, p);
  if (sb) {
    const { error } = await sb.from(t).update(p).eq("id", id);
    if (error) note(error.message);
  } else save();
}
async function del(t, id) {
  D[t] = D[t].filter((x) => x.id != id);
  if (sb) {
    const { error } = await sb.from(t).delete().eq("id", id);
    if (error) note(error.message);
  } else save();
}
async function setFc(week, p) {
  let r = D.forecast.find((x) => +x.week == week);
  if (!r) {
    r = {
      week,
      collections: 0,
      other_in: 0,
      suppliers: 0,
      salaries: 0,
      loan: 0,
      other_exp: 0,
    };
    D.forecast.push(r);
  }
  Object.assign(r, p);
  if (sb) {
    const { error } = await sb.from("forecast").upsert(r);
    if (error) note(error.message);
  } else save();
}
async function setSet(p) {
  Object.assign(D.settings, p);
  if (sb) {
    const { error } = await sb
      .from("settings")
      .upsert({ id: 1, ...D.settings });
    if (error) note(error.message);
  } else save();
}
const F = (e) => {
  e.preventDefault();
  return Object.fromEntries(new FormData(e.target));
};
const rm = async (t, id) => {
  await del(t, id);
  go();
};

/* ---------- Calculations (all from user-entered data) ---------- */
const TXs = () =>
  D.transactions
    .slice()
    .sort((a, b) =>
      a.date > b.date ? 1 : a.date < b.date ? -1 : num(a.id) - num(b.id),
    );
const cin = () => sum(D.transactions.map((r) => num(r.cash_in))),
  cout = () => sum(D.transactions.map((r) => num(r.cash_out)));
const MINC = () => num(D.settings.min_cash),
  cashNow = () => num(D.settings.beginning_cash) + cin() - cout();
const loanBal = () => sum(D.loans.map((l) => num(l.outstanding))),
  invTot = () => sum(D.investments.map((i) => num(i.amount)));
const fv = (k, i) => {
  const r = D.forecast.find((x) => +x.week == i + 1);
  return r ? num(r[k]) : 0;
};
function fcast(cut = 0, shock = 0) {
  let b = cashNow();
  return [0, 1, 2, 3].map((i) => {
    const col = fv("collections", i) * (1 - cut),
      oth = fv("other_in", i),
      inn = col + oth,
      sup = fv("suppliers", i),
      sal = fv("salaries", i),
      loan = fv("loan", i),
      exp = fv("other_exp", i),
      out = sup + sal + loan + exp + (i ? 0 : shock),
      beg = b;
    b = beg + inn - out;
    return {
      beg,
      col,
      oth,
      inn,
      sup,
      sal,
      loan,
      exp,
      out,
      net: inn - out,
      end: b,
    };
  });
}
const lowest = () => Math.min(cashNow(), ...fcast().map((r) => r.end));
const bycat = (k) => {
  const m = {};
  D.transactions.forEach((r) => {
    const v = num(r[k]);
    if (v) {
      const c = r.category || "Other";
      m[c] = (m[c] || 0) + v;
    }
  });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
};
const parts = (es, max = 6) => {
  const p = es
      .slice(0, max)
      .map((e, i) => ({ n: e[0], v: e[1], c: PAL[i % PAL.length] })),
    rest = sum(es.slice(max).map((e) => e[1]));
  if (rest > 0) p.push({ n: "All other", v: rest, c: "#C7D0DB" });
  return p;
};

/* ---------- Charts ---------- */
function donut(p, o = {}) {
  const R = 42,
    C = 2 * Math.PI * R,
    tot = o.total || sum(p.map((x) => x.v)) || 1;
  let off = 0;
  let s = `<svg class="donut" viewBox="0 0 120 120" role="img" aria-label="${esc(o.label || "Donut chart")}"><circle cx="60" cy="60" r="${R}" fill="none" stroke="#E6EBF1" stroke-width="15"/>`;
  p.forEach((x) => {
    const len = Math.max((x.v / tot) * C, 0);
    if (len > 0)
      s += `<circle cx="60" cy="60" r="${R}" fill="none" stroke="${x.c}" stroke-width="15" stroke-dasharray="${Math.max(len - (p.length > 1 ? 1.5 : 0), 0.1)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 60 60)"/>`;
    off += len;
  });
  return (
    s +
    `<text x="60" y="61" text-anchor="middle" class="dv">${o.center || ""}</text><text x="60" y="75" text-anchor="middle" class="dl">${o.sub || ""}</text></svg>`
  );
}
const ring = (p, c, sub, label) =>
  donut([{ v: Math.min(Math.max(p, 0), 1), c }], {
    total: 1,
    center: (p * 100).toFixed(0) + "%",
    sub,
    label,
  });
const legend = (p) =>
  `<div class="lg">${p.map((x) => `<div class="row"><span><i style="background:${x.c}"></i>${esc(x.n)}</span><span class="sub">${phK(x.v)}</span></div>`).join("")}</div>`;

const SEED_TX = [
  // date, description, category, cash in, cash out
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

/* ---------- Chart helpers ---------- */
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
  const x = (i) => pl + (i * (w - pl - pr)) / Math.max(n - 1, 1),
    y = (v) => h - pb - ((v - mn) / (mx - mn || 1)) * (h - pb - pt),
    fm = o.fmt || ((v) => Math.round(v));
  let s = `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${o.label || "Line chart"}"><defs>${series.map((q, i) => `<linearGradient id="gr${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${q.c}" stop-opacity=".22"/><stop offset="1" stop-color="${q.c}" stop-opacity="0"/></linearGradient>`).join("")}</defs>`;
  for (let k = 0; k < 5; k++) {
    const v = mn + (k * (mx - mn || 1)) / 4,
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
    s += `<line x1="${pl}" x2="${w - pr}" y1="${yy}" y2="${yy}" stroke="#f5b301" stroke-dasharray="5 4"/><text x="${pl + 4}" y="${yy - 5}" style="fill:#8a5d00">Minimum cash balance</text>`;
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
    x = (i) => (i * w) / Math.max(d.length - 1, 1),
    y = (v) => h - 4 - ((v - mn) / (mx - mn || 1)) * (h - 10);
  let p = `M${x(0)},${y(d[0])}`;
  for (let i = 1; i < d.length; i++) {
    const c = (x(i - 1) + x(i)) / 2;
    p += ` C${c},${y(d[i - 1])} ${c},${y(d[i])} ${x(i)},${y(d[i])}`;
  }
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Uptime trend"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00c98d" stop-opacity=".25"/><stop offset="1" stop-color="#00c98d" stop-opacity="0"/></linearGradient></defs><path d="${p} L${w},${h} L0,${h}Z" fill="url(#sg)"/><path d="${p}" fill="none" stroke="#00c98d" stroke-width="1.6"/></svg>`;
}
function how(k) {
  const i = INFO[k];
  return `<div class="card"><div class="h">How it works</div><p class="sub">${i.sum}</p><div class="flow">${i.flow.map((s) => `<div class="step"><b>${s[0]}</b><em>${s[1]}</em><p>${s[2]}</p></div>`).join("")}</div></div>
 <div class="card"><div class="trio"><div><b>Purpose</b>${i.purpose}</div><div><b>Financial data</b>${i.data}</div><div><b>Potential benefit</b>${i.benefit}</div></div></div>`;
}

/* ---------- Form helpers ---------- */
const inp = (n, l, t = "text", x = "", c = "") =>
  `<label class="${c}">${l}<input name="${n}" type="${t}" ${x}></label>`;
const money$ = (n, l) => inp(n, l, "number", 'step="0.01" min="0" required');
const X = (t, id) =>
  `<button class="x" onclick="rm('${t}',${JSON.stringify(id)})" aria-label="Delete">✕</button>`;
const none = (m) => `<div class="empty">${m}</div>`;

/* ---------- Pages ---------- */
function overview() {
  if (!D.transactions.length)
    return `<div class="card"><div class="h">Welcome to TreasuryIQ</div><p class="sub mt">No data yet. Enter your own cash transactions, or load the sample workbook to see how every page works.</p><div class="frm"><a class="btn pri" href="#cash">Add a transaction</a><button class="btn" onclick="doSeed()">Load sample data</button></div></div>`;
  const R = fcast(),
    ti = sum(R.map((r) => r.inn)),
    to = sum(R.map((r) => r.out)),
    lo = lowest(),
    mc = MINC(),
    ok = lo >= mc,
    now = cashNow(),
    trend = [now, ...R.map((r) => r.end)],
    tx = TXs();
  let chart, leg;
  if (range == "Actual") {
    const ds = [...new Set(tx.map((r) => r.date))],
      ci = [],
      co = [];
    let a = 0,
      b = 0;
    ds.forEach((d) => {
      tx.filter((r) => r.date == d).forEach((r) => {
        a += num(r.cash_in);
        b += num(r.cash_out);
      });
      ci.push(a / 1000);
      co.push(b / 1000);
    });
    chart =
      ds.length < 2
        ? none(
            "Add transactions on at least two different dates to draw this chart.",
          )
        : line(
            [
              { d: ci, c: "#00c98d" },
              { d: co, c: "#3d5fb5" },
            ],
            ds.map((d, i) => (i % Math.ceil(ds.length / 7) == 0 ? dl(d) : "")),
            { min: 0, fmt: fmK, label: "Cumulative cash in and cash out" },
          );
    leg = [cin(), cout()];
  } else {
    chart = line(
      [
        { d: R.map((r) => r.inn / 1000), c: "#00c98d" },
        { d: R.map((r) => r.out / 1000), c: "#3d5fb5" },
      ],
      ["W1", "W2", "W3", "W4"],
      { min: 0, fmt: fmK, label: "Forecast cash in and cash out" },
    );
    leg = [ti, to];
  }
  return `<div class="cols"><div class="stack">
 <div class="kpis">
  <div class="card"><div class="lbl">Current Cash Balance</div><div class="big">${php(now)}</div><div class="sub">Beginning cash plus cash in minus cash out</div>
   <div class="cur"><span class="hl">Cash in <b>${phK(cin())}</b></span><span>Cash out <b>${phK(cout())}</b></span><span>Loans <b>${phK(loanBal())}</b></span><span>Investments <b>${phK(invTot())}</b></span></div></div>
  <div class="card"><div class="lbl">Expected Cash Inflows</div><div class="big">${php(ti)}</div><div class="sub">Next 4 weeks, vs ${php(to)} out</div>
   <div class="lines">${R.map((r, i) => `<span>Week ${i + 1} · ${php(r.inn)}</span>`).join("")}</div></div>
  <div class="card"><div class="lbl">Minimum Cash Coverage</div><div class="dn">
   ${donut(
     [
       { v: Math.min(mc, Math.max(lo, 0)), c: ok ? "#f5b301" : "#ff4a1c" },
       { v: Math.max(lo - mc, 0), c: "#00c98d" },
     ],
     {
       center: mc ? ((lo / mc) * 100).toFixed(0) + "%" : "–",
       sub: "of minimum",
       label: "Minimum cash coverage",
     },
   )}
   <div class="lg"><div><i style="background:${ok ? "#f5b301" : "#ff4a1c"}"></i>Policy minimum ${phK(mc)}</div><div><i style="background:#00c98d"></i>Free cash ${phK(Math.max(lo - mc, 0))}</div></div></div>
   <div class="sub mt">Lowest projected balance ${php(lo)}</div></div>
 </div>
 <div class="card"><div class="row"><div><div class="h">Cash Flow Volume</div><div class="sub">${range == "Actual" ? "Cumulative cash in and cash out from your transactions" : "Weekly cash in and cash out from your forecast"}</div></div>
  <div class="tabs">${["Actual", "Forecast"].map((r) => `<button class="${r == range ? "on" : ""}" onclick="range='${r}';go()">${r}</button>`).join("")}</div></div>
  <div class="leg"><span><i style="background:#00c98d"></i>Cash in ₱${fmK(leg[0] / 1000)}</span><span><i style="background:#3d5fb5"></i>Cash out ₱${fmK(leg[1] / 1000)}</span></div>${chart}</div>
 <div class="card"><div class="row"><div class="h">Latest Transactions</div><a class="btn" href="#cash">See All</a></div>
  <table><tr><th>Date</th><th>Description</th><th>Type</th><th class="n">Amount</th></tr>
  ${tx
    .slice(-5)
    .reverse()
    .map((r) => {
      const t = num(r.cash_in)
        ? ["Cash in", "p-g"]
        : num(r.cash_out)
          ? ["Cash out", "p-b"]
          : ["Non-cash", "p-w"];
      return `<tr><td class="sub">${dl(r.date)}</td><td>${esc(r.description)}</td><td><span class="pill ${t[1]}">${t[0]}</span></td><td class="n">${php(num(r.cash_in) || num(r.cash_out))}</td></tr>`;
    })
    .join("")}</table></div>
 </div><div class="stack">
 <div class="card"><div class="row"><div class="h">Treasury Health</div><span class="ok">${ok ? "Within policy" : "Review needed"}</span></div>
  <div class="row mt"><span class="lbl">Projected cash trend</span><b class="h">₱${fmK(R[3].end / 1000)}</b></div>${spark(trend)}
  <div class="rings"><div>${ring(now > 0 ? loanBal() / now : 0, "#3d5fb5", "loan-to-cash", "Loan to cash ratio")}<div class="sub">Loan-to-cash</div></div>
  <div>${ring(ti > 0 ? to / ti : 0, "#00c98d", "of inflows", "Outflows as share of inflows")}<div class="sub">Outflows vs inflows</div></div></div>
  <div class="row mt"><span class="lbl">Risk monitoring</span><a class="link" href="#risk">Open →</a></div></div>
 <div class="card"><div class="h">Investments and Loans</div>
  ${D.investments.length ? `<table class="sm mt"><tr><th>Item</th><th class="n">Amount</th><th class="n">Rate</th><th class="n">Matures</th></tr>${D.investments.map((i) => `<tr><td>${esc(i.name)}</td><td class="n">${phK(num(i.amount))}</td><td class="n">${num(i.rate).toFixed(2)}%</td><td class="n">${dl(i.maturity)}</td></tr>`).join("")}</table>` : none("No investments yet. Add them on Risk Monitoring.")}
  <div class="callout">${D.loans.length ? D.loans.map((l) => `${esc(l.name)}: ${php(num(l.outstanding))} outstanding of ${phK(num(l.original))}, paid ${php(num(l.monthly_payment))} a month.`).join("<br>") : "No loans recorded."}</div></div>
 </div></div>`;
}

async function addTx(e) {
  const v = F(e),
    a = num(v.amount);
  await ins("transactions", {
    date: v.date,
    description: v.description,
    category: v.category || "Uncategorized",
    cash_in: v.type == "in" ? a : 0,
    cash_out: v.type == "out" ? a : 0,
  });
  go();
}
function cash() {
  const co = cout(),
    ps = parts(bycat("cash_out")),
    cats = [...new Set(D.transactions.map((r) => r.category).filter(Boolean))];
  return `<div class="stack"><div class="g2">
 <div class="card"><div class="h">Cash position</div><table class="sm mt">
 ${[
   ["Beginning cash balance", num(D.settings.beginning_cash)],
   ["Total cash in", cin()],
   ["Total cash out", co],
   ["Net cash flow", cin() - co],
   ["Ending cash balance", cashNow()],
 ]
   .map(
     (r, i) =>
       `<tr><td>${i == 4 ? "<b>" + r[0] + "</b>" : r[0]}</td><td class="n">${i == 4 ? "<b>" + php(r[1]) + "</b>" : php(r[1])}</td></tr>`,
   )
   .join("")}</table></div>
 <div class="card"><div class="h">Where the cash went</div>${co ? `<div class="dn">${donut(ps, { center: "₱" + fmK(co / 1000), sub: "cash out", label: "Cash out by category" })}${legend(ps)}</div>` : none("Cash-out transactions will appear here as a chart.")}</div></div>
 <div class="card"><div class="h">Add a transaction</div>
 <form class="frm" onsubmit="addTx(event)">${inp("date", "Date", "date", `value="${today()}" required`)}${inp("description", "Description", "text", 'required placeholder="What happened?"', "grow")}${inp("category", "Category", "text", 'list="cats" placeholder="e.g. Sales revenue"')}
 <label>Type<select name="type"><option value="in">Cash in</option><option value="out">Cash out</option></select></label>${money$("amount", "Amount (₱)")}<button class="btn pri">Add</button></form>
 <datalist id="cats">${cats.map((c) => `<option value="${esc(c)}">`).join("")}</datalist></div>
 <div class="card"><div class="h">Cash transactions</div>${
   D.transactions.length
     ? `<div class="sc"><table><tr><th>Date</th><th>Description</th><th>Category</th><th class="n">Cash in</th><th class="n">Cash out</th><th></th></tr>
 ${TXs()
   .map(
     (r) =>
       `<tr><td class="sub">${dl(r.date)}</td><td>${esc(r.description)}</td><td class="sub">${esc(r.category)}</td><td class="n" style="color:var(--gt)">${num(r.cash_in) ? php(num(r.cash_in)) : ""}</td><td class="n">${num(r.cash_out) ? php(num(r.cash_out)) : ""}</td><td>${X("transactions", r.id)}</td></tr>`,
   )
   .join("")}</table></div>`
     : none("No transactions yet. Add your first one above.")
 }</div>${how("cash")}</div>`;
}

async function addPay(e) {
  const v = F(e);
  await ins("payments", { payee: v.payee, amount: num(v.amount), stage: 0 });
  go();
}
async function advPay(id) {
  const p = D.payments.find((x) => x.id == id);
  await upd("payments", id, { stage: Math.min(num(p.stage) + 1, 4) });
  go();
}
function pay() {
  const R = fcast(),
    pc = (s) => (s >= 4 ? "p-g" : s >= 2 ? "p-b" : "p-w");
  return `<div class="stack"><div class="card"><div class="h">Payment queue</div><div class="sub">Add a payment, then press Advance to move it to the next stage</div>
 <form class="frm" onsubmit="addPay(event)">${inp("payee", "Payee or description", "text", "required", "grow")}${money$("amount", "Amount (₱)")}<button class="btn pri">Add payment</button></form>
 ${
   D.payments.length
     ? `<table class="mt"><tr><th>Payee</th><th class="n">Amount</th><th>Stage</th><th></th><th></th></tr>
 ${D.payments
   .map(
     (
       p,
     ) => `<tr><td>${esc(p.payee)}</td><td class="n">${php(num(p.amount))}</td><td><span class="pill ${pc(num(p.stage))}">${STAGES[num(p.stage)]}</span></td>
 <td class="n">${num(p.stage) < 4 ? `<button class="btn" onclick="advPay(${JSON.stringify(p.id)})">Advance</button>` : `<span class="sub">Done</span>`}</td><td>${X("payments", p.id)}</td></tr>`,
   )
   .join("")}</table>`
     : none("No payments yet.")
 }
 <div class="callout">Every payment passes the same stages: ${STAGES.join(", ")}. Nobody re-types a payment into a bank portal.</div></div>
 <div class="card"><div class="h">Scheduled cash outflows (from your forecast)</div><table class="sm mt"><tr><th></th><th class="n">Suppliers</th><th class="n">Salaries</th><th class="n">Loan</th><th class="n">Other</th><th class="n">Total</th></tr>
 ${R.map((r, i) => `<tr><td>Week ${i + 1}</td><td class="n">${php(r.sup)}</td><td class="n">${php(r.sal)}</td><td class="n">${php(r.loan)}</td><td class="n">${php(r.exp)}</td><td class="n"><b>${php(r.out)}</b></td></tr>`).join("")}</table></div>${how("pay")}</div>`;
}

const FIELDS = [
  ["Expected cash collections", "collections"],
  ["Other cash inflows", "other_in"],
  ["Supplier payments", "suppliers"],
  ["Salaries and wages", "salaries"],
  ["Loan payments", "loan"],
  ["Other expenses", "other_exp"],
];
const FT = [
  ["Beginning cash balance", "beg"],
  ["Total cash inflows", "inn"],
  ["Total cash outflows", "out"],
  ["Net cash flow", "net"],
  ["Ending cash balance", "end"],
];
function fcDyn() {
  const R = fcast(cut),
    mn = Math.min(...R.map((r) => r.end)),
    mc = MINC(),
    op = [
      ["Suppliers", sum(R.map((r) => r.sup))],
      ["Salaries", sum(R.map((r) => r.sal))],
      ["Loan payments", sum(R.map((r) => r.loan))],
      ["Other expenses", sum(R.map((r) => r.exp))],
    ],
    tot = sum(op.map((o) => o[1])),
    pp = op.map((o, i) => ({ n: o[0], v: o[1], c: PAL[i] }));
  return `<div class="g2"><div class="card"><div class="h">Four-week cash forecast</div>${line([{ d: [cashNow(), ...R.map((r) => r.end)], c: cut ? "#f5b301" : "#00c98d" }], ["Now", "W1", "W2", "W3", "W4"], { h: 240, thr: mc, min: Math.min(mn, mc, cashNow()) * 0.9, max: Math.max(cashNow(), ...R.map((r) => r.end)) * 1.04, fmt: (v) => "₱" + fmK(v / 1000), label: "Cash forecast" })}
 <div class="callout ${mn < mc ? "bad" : ""}">${mn < mc ? `Warning: cash drops to ${php(mn)}, below the ${phK(mc)} minimum.` : `Lowest projected balance is ${php(mn)}, ${php(mn - mc)} above the ${phK(mc)} minimum cash balance.`}</div></div>
 <div class="card"><div class="h">Where the outflows go</div>${tot ? `<div class="dn">${donut(pp, { center: "₱" + fmK(tot / 1000), sub: "4 weeks", label: "Outflow mix" })}${legend(pp)}</div>` : none("Enter outflows below to see the mix.")}</div></div>`;
}
function fcCalc() {
  const R = fcast(cut);
  return `<table class="sm mt"><tr><th></th>${R.map((r, i) => `<th class="n">Week ${i + 1}</th>`).join("")}</tr>${FT.map(([n, k]) => `<tr><td><b>${n}</b></td>${R.map((r) => `<td class="n">${php(r[k])}</td>`).join("")}</tr>`).join("")}</table>`;
}
function fcRefresh() {
  $("#dyn").innerHTML = fcDyn();
  $("#calc").innerHTML = fcCalc();
}
async function fcCell(w, k, v) {
  await setFc(w, { [k]: num(v) });
  fcRefresh();
}
function fc() {
  return `<div class="stack"><div class="card"><div class="h">What if customers pay less than expected?</div><div class="sub">Expected collections come in <b id="sl" style="color:var(--ink)">${Math.round(cut * 100)}% lower</b></div>
 <input type="range" min="0" max="100" step="5" value="${Math.round(cut * 100)}" oninput="cut=+this.value/100;$('#sl').textContent=this.value+'% lower';fcRefresh()" aria-label="Collections shortfall in percent"></div>
 <div id="dyn">${fcDyn()}</div>
 <div class="card"><div class="h">Enter your weekly forecast</div><div class="sub">Type the amounts you expect. Changes save automatically.</div>
 <table class="sm mt"><tr><th></th>${[1, 2, 3, 4].map((w) => `<th class="n">Week ${w}</th>`).join("")}</tr>
 ${FIELDS.map(([n, k]) => `<tr><td>${n}</td>${[0, 1, 2, 3].map((i) => `<td class="n"><input type="number" step="0.01" min="0" value="${fv(k, i)}" onchange="fcCell(${i + 1},'${k}',this.value)" aria-label="${n}, week ${i + 1}"></td>`).join("")}</tr>`).join("")}</table>
 <div id="calc">${fcCalc()}</div></div>${how("fc")}</div>`;
}

async function addLoan(e) {
  const v = F(e);
  await ins("loans", {
    name: v.name,
    original: num(v.original),
    monthly_payment: num(v.monthly_payment),
    outstanding: num(v.outstanding),
  });
  go();
}
async function addInv(e) {
  const v = F(e);
  await ins("investments", {
    name: v.name,
    amount: num(v.amount),
    rate: num(v.rate),
    maturity: v.maturity || null,
  });
  go();
}
function riskDyn() {
  const mc = MINC(),
    mn = Math.min(...fcast(0, shock).map((r) => r.end)),
    room = Math.min(...fcast().map((r) => r.end)) - mc;
  return `<div class="big" style="color:${mn < mc ? "#c8300c" : "var(--gt)"}">${php(mn)}</div><div class="sub">Lowest projected balance over four weeks</div>
 <div class="callout ${mn < mc ? "bad" : ""}">${mn < mc ? `This shock breaks the ${phK(mc)} minimum cash policy.` : `Still above the ${phK(mc)} minimum.`} Cash can absorb a one-time shock of up to ${php(Math.max(room, 0))} before breaching policy.</div>`;
}
function risk() {
  const R = fcast(),
    mc = MINC(),
    now = cashNow();
  return `<div class="stack"><div class="card"><div class="h">Stress test: an unexpected cash shock in Week 1</div><div class="sub">One-time payment of <b id="sl" style="color:var(--ink)">${phK(shock)}</b></div>
 <input type="range" min="0" max="1500000" step="50000" value="${shock}" oninput="shock=+this.value;$('#sl').textContent='₱'+f(shock);$('#dyn').innerHTML=riskDyn()" aria-label="Cash shock amount"><div id="dyn">${riskDyn()}</div></div>
 <div class="g2"><div class="card"><div class="h">Minimum cash policy (${phK(mc)})</div><table class="sm mt"><tr><th>Week</th><th class="n">Ending cash</th><th class="n">Headroom</th><th>Status</th></tr>
 ${R.map((r, i) => `<tr><td>Week ${i + 1}</td><td class="n">${php(r.end)}</td><td class="n">${php(r.end - mc)}</td><td><span class="pill ${r.end < mc ? "p-r" : "p-g"}">${r.end < mc ? "Below" : "Within"}</span></td></tr>`).join("")}</table></div>
 <div class="card"><div class="h">Loan-to-cash ratio</div><div class="dn">${ring(now > 0 ? loanBal() / now : 0, "#3d5fb5", "of cash", "Loan to cash ratio")}<div class="lg"><div>${php(loanBal())} owed</div><div class="sub">against ${php(now)} cash</div></div></div></div></div>
 <div class="card"><div class="h">Loans</div>${D.loans.length ? `<table class="sm mt"><tr><th>Loan</th><th class="n">Original</th><th class="n">Monthly payment</th><th class="n">Outstanding</th><th></th></tr>${D.loans.map((l) => `<tr><td>${esc(l.name)}</td><td class="n">${php(num(l.original))}</td><td class="n">${php(num(l.monthly_payment))}</td><td class="n">${php(num(l.outstanding))}</td><td>${X("loans", l.id)}</td></tr>`).join("")}</table>` : none("No loans yet.")}
 <form class="frm" onsubmit="addLoan(event)">${inp("name", "Loan name", "text", "required", "grow")}${money$("original", "Original amount")}${money$("monthly_payment", "Monthly payment")}${money$("outstanding", "Outstanding balance")}<button class="btn pri">Add loan</button></form></div>
 <div class="card"><div class="h">Investments and maturities</div>${
   D.investments.length
     ? `<table class="sm mt"><tr><th>Investment</th><th class="n">Amount</th><th class="n">Rate</th><th class="n">Matures</th><th class="n">Est. yearly interest</th><th></th></tr>
 ${D.investments
   .map((i) => {
     const d = i.maturity ? daysTo(i.maturity) : null;
     return `<tr><td>${esc(i.name)}</td><td class="n">${php(num(i.amount))}</td><td class="n">${num(i.rate).toFixed(2)}%</td><td class="n">${dl(i.maturity)} ${d == null ? "" : `<span class="pill ${d < 0 ? "p-b" : d <= 30 ? "p-w" : "p-g"}">${d < 0 ? "Matured" : d + " days left"}</span>`}</td><td class="n">${php((num(i.amount) * num(i.rate)) / 100)}</td><td>${X("investments", i.id)}</td></tr>`;
   })
   .join("")}</table>`
     : none("No investments yet.")
 }
 <form class="frm" onsubmit="addInv(event)">${inp("name", "Investment name", "text", "required", "grow")}${money$("amount", "Amount invested")}${inp("rate", "Interest rate (%)", "number", 'step="0.01" min="0" required')}${inp("maturity", "Maturity date", "date")}<button class="btn pri">Add investment</button></form></div>${how("risk")}</div>`;
}

async function addBank(e) {
  const v = F(e);
  await ins("bank_items", {
    date: v.date,
    description: v.description,
    amount: v.type == "out" ? -num(v.amount) : num(v.amount),
  });
  go();
}
function reco() {
  const used = new Set(),
    tx = TXs(),
    net = (t) => num(t.cash_in) - num(t.cash_out),
    free = (t) => !used.has(t.id);
  return D.bank_items
    .slice()
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .map((b) => {
      const amt = num(b.amount);
      let t = tx.find(
        (t) => free(t) && t.date == b.date && Math.abs(net(t) - amt) < 0.005,
      );
      if (t) {
        used.add(t.id);
        return { b, t, r: ["Matched", "p-g"] };
      }
      t = tx.find(
        (t) =>
          free(t) &&
          t.date == b.date &&
          net(t) &&
          Math.sign(net(t)) == Math.sign(amt) &&
          Math.abs(net(t) - amt) <= 100,
      );
      if (t) {
        used.add(t.id);
        return {
          b,
          t,
          r: ["Differs by " + php(Math.abs(net(t) - amt)), "p-w"],
        };
      }
      t = tx.find(
        (t) =>
          free(t) &&
          net(t) &&
          Math.abs(net(t) - amt) < 0.005 &&
          Math.abs(new Date(t.date) - new Date(b.date)) <= 3 * 864e5,
      );
      if (t) {
        used.add(t.id);
        return { b, t, r: ["Date differs", "p-w"] };
      }
      return { b, t: null, r: ["No ledger entry", "p-r"] };
    });
}
function rec() {
  const C = reco(),
    ok = C.filter((c) => c.r[0] == "Matched").length;
  return `<div class="stack"><div class="card"><div class="row"><div class="h">Bank statement vs your cash book</div><button class="btn pri" onclick="recRun=!recRun;go()">${recRun ? "Reset" : "Run auto-match"}</button></div>
 <div class="sub">Enter the lines from your bank statement. The rules engine pairs each one with a transaction by date and amount.</div>
 <form class="frm" onsubmit="addBank(event)">${inp("date", "Date", "date", `value="${today()}" required`)}${inp("description", "Bank description", "text", "", "grow")}<label>Type<select name="type"><option value="in">Deposit</option><option value="out">Withdrawal</option></select></label>${money$("amount", "Amount (₱)")}<button class="btn">Add line</button></form>
 ${
   C.length
     ? `<table class="mt"><tr><th>Date</th><th>Bank line</th><th class="n">Amount</th><th>Matched cash-book entry</th><th>Result</th><th></th></tr>
 ${C.map((c) => `<tr><td class="sub">${dl(c.b.date)}</td><td>${esc(c.b.description)}</td><td class="n">${php(num(c.b.amount))}</td><td class="sub">${recRun && c.t ? esc(c.t.description) : ""}</td><td>${recRun ? `<span class="pill ${c.r[1]}">${c.r[0]}</span>` : '<span class="pill">Unchecked</span>'}</td><td>${X("bank_items", c.b.id)}</td></tr>`).join("")}</table>`
     : none("No bank lines yet.")
 }
 <div class="callout">${recRun ? `${ok} of ${C.length} lines matched automatically. People only review the ${C.length - ok} exceptions.` : "Nothing matched yet. Run the auto-match to see the rules engine work."}</div></div>${how("rec")}</div>`;
}

function csv() {
  const t = [
      "Date,Description,Category,Cash in,Cash out",
      ...TXs().map((r) =>
        [r.date, r.description, r.category, num(r.cash_in), num(r.cash_out)]
          .map((v) => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`)
          .join(","),
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
    ps = parts(bycat("cash_in"));
  return `<div class="stack"><div class="kpis">
 <div class="card"><div class="lbl">Current cash balance</div><div class="big">${php(now)}</div></div>
 <div class="card"><div class="lbl">Projected ending cash</div><div class="big">${php(R[3].end)}</div></div>
 <div class="card"><div class="lbl">Outstanding loans</div><div class="big">${php(loanBal())}</div></div></div>
 <div class="g2"><div class="card"><div class="row"><div class="h">Treasury dashboard</div><button class="btn" onclick="csv()">Download transactions (CSV)</button></div><table class="sm mt">
 ${[
   ["Current cash balance", now],
   ["Total expected cash inflows", ti],
   ["Total expected cash outflows", to],
   ["Projected ending cash balance", R[3].end],
   ["Total outstanding loans", loanBal()],
   ["Total investments", invTot()],
 ]
   .map((r) => `<tr><td>${r[0]}</td><td class="n">${php(r[1])}</td></tr>`)
   .join("")}</table></div>
 <div class="card"><div class="h">Where the cash came from</div>${cin() ? `<div class="dn">${donut(ps, { center: "₱" + fmK(cin() / 1000), sub: "cash in", label: "Cash in by source" })}${legend(ps)}</div>` : none("Cash-in transactions will appear here.")}</div></div>
 <div class="card"><div class="h">Automated commentary</div><p class="mt">${esc(D.settings.company)} holds ${php(now)} in cash after receiving ${php(cin())} and paying out ${php(cout())}. The next four weeks bring ${php(ti)} in and ${php(to)} out, taking cash to ${php(R[3].end)} by Week 4. The lowest balance is ${php(lowest())}, which is ${lowest() >= MINC() ? php(lowest() - MINC()) + " above" : php(MINC() - lowest()) + " below"} the ${phK(MINC())} minimum. ${php(loanBal())} is still owed on loans and ${php(invTot())} sits in investments.</p>
 <div class="callout">This text is written by the system from the numbers on the other pages. Change a number and it changes here.</div></div>${how("rep")}</div>`;
}

async function saveSettings(e) {
  const v = F(e);
  await setSet({
    company: v.company || "My Company",
    beginning_cash: num(v.beginning_cash),
    min_cash: num(v.min_cash),
  });
  note("Settings saved");
  go();
}
async function doSeed() {
  await bulk(
    "transactions",
    SEED_TX.map((r) => ({
      date: r[0],
      description: r[1],
      category: r[2],
      cash_in: r[3],
      cash_out: r[4],
    })),
  );
  [
    [285450, 20000, 83400, 7500, 45833.33, 2500],
    [265500, 10000, 76360, 7500, 0, 7678.25],
    [315000, 13000, 38400, 7500, 0, 6149],
    [350000, 5000, 95600, 7500, 0, 2500],
  ].forEach((r, i) =>
    setFc(i + 1, {
      collections: r[0],
      other_in: r[1],
      suppliers: r[2],
      salaries: r[3],
      loan: r[4],
      other_exp: r[5],
    }),
  );
  await bulk("loans", [
    {
      name: "Working Capital Loan",
      original: 500000,
      monthly_payment: 45833.33,
      outstanding: 454166.67,
    },
  ]);
  await bulk("investments", [
    { name: "Treasury Bills", amount: 500000, rate: 5, maturity: "2026-11-30" },
    {
      name: "Time Deposit",
      amount: 245037.87,
      rate: 3,
      maturity: "2026-10-01",
    },
  ]);
  await bulk(
    "payments",
    [
      ["ABC Bank loan installment, Week 1", 45833.33, 2],
      ["Supplier payments, Week 1", 83400, 1],
      ["Salaries and wages, Week 1", 7500, 0],
      ["Supplier payments, Week 2", 76360, 0],
    ].map((r) => ({ payee: r[0], amount: r[1], stage: r[2] })),
  );
  await bulk(
    "bank_items",
    [
      ["2026-08-28", 32400],
      ["2026-08-30", 38400],
      ["2026-08-31", 31350],
      ["2026-09-02", 29870],
      ["2026-09-03", 24750],
      ["2026-09-04", 30260],
      ["2026-09-05", 13240],
      ["2026-09-07", -3750],
      ["2026-09-08", -35],
    ].map((r) => ({
      date: r[0],
      description: r[1] < 0 ? "Withdrawal" : "Deposit",
      amount: r[1],
    })),
  );
  await setSet({
    company: "Aqua Defense Construction Inc.",
    beginning_cash: 0,
    min_cash: 300000,
  });
  note("Sample data loaded");
  go();
}
async function doWipe() {
  if (!confirm("Delete ALL data in TreasuryIQ? This cannot be undone.")) return;
  for (const t of T) {
    D[t] = [];
    if (sb) {
      const q = sb.from(t).delete();
      const { error } = await (t == "forecast"
        ? q.gte("week", 0)
        : q.not("id", "is", null));
      if (error) note(error.message);
    }
  }
  if (!sb) save();
  note("All data deleted");
  go();
}
function settings() {
  const s = D.settings;
  return `<div class="stack">${USER ? `<div class="card"><div class="h">Account</div><p class="mt">Signed in as <b>${esc(USER.email)}</b></p><div class="frm"><button class="btn" onclick="logout()">Log out</button></div></div>` : ""}<div class="card"><div class="h">Company and policy</div>
 <form class="frm" onsubmit="saveSettings(event)">${inp("company", "Company name", "text", `value="${esc(s.company)}"`, "grow")}${inp("beginning_cash", "Beginning cash balance (₱)", "number", `step="0.01" value="${num(s.beginning_cash)}"`)}${inp("min_cash", "Minimum cash balance (₱)", "number", `step="0.01" min="0" value="${num(s.min_cash)}"`)}<button class="btn pri">Save</button></form></div>
 <div class="card"><div class="h">Database</div><p class="mt">${sb ? "Connected to Supabase. Everyone with an account shares the same data." : "Demo mode. Data is saved only in this browser. To share it, add your Supabase URL and anon key to config.js."}</p>
 <div class="frm"><button class="btn" onclick="doSeed()">Load sample data</button><button class="btn" onclick="doWipe()">Delete all data</button></div></div></div>`;
}

/* ---------- Router ---------- */
const PAGES = { overview, cash, pay, fc, risk, rec, rep, settings };
let cut = 0,
  shock = 0,
  range = "Actual",
  recRun = false;
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
    name = i ? i.n : id == "settings" ? "Settings" : "Treasury Overview";
  $("#ttl").textContent = name;
  $("#date").textContent = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  $("#co").textContent = D.settings.company || "TreasuryIQ";
  $("#mode").textContent = sb
    ? "Database: Supabase"
    : "Demo mode: saved in this browser only";
  $("#view").innerHTML = PAGES[id]();
  const link = (k, n, p) =>
    `<a class="ico ${id == k ? "on" : ""}" href="#${k}" data-tip="${n}" aria-label="${n}" ${id == k ? 'aria-current="page"' : ""}>${ic(p)}</a>`;
  $("#nav").innerHTML =
    link("overview", "Treasury Overview", GRID) +
    ORDER.map((k) => link(k, INFO[k].n, INFO[k].ic)).join("");
  $("#gear").classList.toggle("on", id == "settings");
  $("#logout").hidden = !USER;
  $("#av").textContent = ((USER &&
    (USER.user_metadata.full_name || USER.email)) ||
    "T")[0].toUpperCase();
  $("#av").title = USER ? USER.email : "";
  document.title = name + " | TreasuryIQ";
}
/* ---------- Accounts (Supabase Auth) ---------- */
const AI = {
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  off: '<path d="M3 3l18 18M10.6 6.2A9.8 9.8 0 0112 6c5 0 8.5 4 9.5 6a14 14 0 01-3.2 3.8M6.5 7.6A14 14 0 002.5 12c1 2 4.5 6 9.5 6 1.5 0 2.8-.3 4-.9"/>',
  on: '<path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6z"/><circle cx="12" cy="12" r="2.6"/>',
};
const asvg = (p) =>
  `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const pf = (n, ph, t = "text", x = "", icon = "") =>
  `<div class="pf"><input name="${n}" type="${t}" placeholder="${ph}" aria-label="${ph}" ${x}>${icon == "eye" ? `<button type="button" class="eye" onclick="eye(this)" aria-label="Show password">${asvg(AI.off)}</button>` : icon ? `<span>${asvg(AI[icon])}</span>` : ""}</div>`;
function eye(b) {
  const i = b.parentNode.querySelector("input"),
    show = i.type == "password";
  i.type = show ? "text" : "password";
  b.innerHTML = asvg(show ? AI.on : AI.off);
  b.setAttribute("aria-label", show ? "Hide password" : "Show password");
}
const INFOPG = {
  about: [
    "About TreasuryIQ",
    "TreasuryIQ is a treasury management prototype built for a school project. It brings six treasury functions into one place: cash visibility, payments, forecasting, risk monitoring, reconciliation, and reporting.",
  ],
  faq: [
    "FAQ",
    "Who can see the data? Only people with an account, and everyone who is signed in shares the same company data. How do I reset my password? Use Forgot Password on the log in page and we email you a reset link. Where is the data stored? In a Supabase database.",
  ],
  credits: [
    "Credits",
    "TreasuryIQ was built for the Treasury and Management project. Sign-in and data storage are powered by Supabase, and the site is hosted on Vercel.",
  ],
};
function showAuth(mode = authMode) {
  if (!INFOPG[mode]) authMode = mode;
  document.querySelector(".frame").hidden = true;
  const a = $("#auth"),
    su = mode == "signup",
    rs = mode == "reset",
    ip = INFOPG[mode];
  a.hidden = false;
  const logo =
    '<svg viewBox="0 0 64 56" width="64" height="56" aria-hidden="true"><circle cx="40" cy="20" r="16" fill="#aeb3bd"/><circle cx="26" cy="32" r="18" fill="#0b63c8"/><text x="26" y="39" text-anchor="middle" font-size="20" font-weight="700" fill="#fff" font-family="Fira Sans,sans-serif">€</text></svg>';
  const body = ip
    ? `<h1>${ip[0]}</h1><p class="ainfo">${ip[1]}</p><button class="abtn" onclick="showAuth('login')">Back to log in</button>`
    : `<h1>${rs ? "Set a New Password" : su ? "Create Account" : "Log in to your Account"}</h1>
 <form class="aform ${su ? "two" : ""}" onsubmit="authSubmit(event)">
 ${su ? pf("last", "Enter Last Name", "text", 'required autocomplete="family-name"') + pf("first", "Enter First Name", "text", 'required autocomplete="given-name"') + pf("mi", "Enter Middle Initial", "text", 'maxlength="2" autocomplete="additional-name"') : ""}
 ${rs ? "" : pf("email", "Enter Email", "email", 'required autocomplete="email"', "mail")}
 ${pf("password", rs ? "Enter New Password" : "Enter Password", "password", `required minlength="6" autocomplete="${su || rs ? "new-password" : "current-password"}"`, su || rs ? "eye" : "lock")}
 ${su || rs ? pf("confirm", "Re-enter Password", "password", 'required minlength="6" autocomplete="new-password"', "eye") : ""}
 <div id="authmsg" class="authmsg" role="alert" aria-live="polite"></div>
 <button class="abtn">${rs ? "Update Password" : su ? "Sign Up" : "Log In"}</button></form>
 ${mode == "login" ? '<button class="alink" onclick="forgot()">Forgot Password?</button>' : ""}`;
  a.innerHTML = `<div class="atop"><a href="#" onclick="showAuth('login');return false">Home</a><a href="#" onclick="showAuth('credits');return false">Credits</a>${rs ? "" : `<button class="apill" onclick="showAuth('${su ? "login" : "signup"}')">${su ? "Sign In" : "Sign Up"}</button>`}</div>
 <div class="amain">${logo}${body}</div>
 <div class="afoot"><span><a href="#" onclick="showAuth('about');return false">About Us</a><a href="#" onclick="showAuth('faq');return false">FAQ</a></span><span>© ${new Date().getFullYear()} - TreasuryIQ - Treasury management prototype</span></div>`;
  if (!sb && !ip)
    $("#authmsg").textContent =
      "Preview only. Add your Supabase keys in config.js to turn on real accounts.";
}
const say = (t, bad = 1) => {
  const m = $("#authmsg");
  m.textContent = t;
  m.className = "authmsg " + (bad ? "bad" : "good");
};
async function doAuth(v) {
  if (!sb)
    return say(
      "Preview only. Add your Supabase keys in config.js to turn on real accounts.",
    );
  if (authMode == "reset") {
    if (v.password !== v.confirm) return say("Passwords do not match.");
    const { error } = await sb.auth.updateUser({ password: v.password });
    if (error) return say(error.message);
    recovering = false;
    return render();
  }
  if (authMode == "signup") {
    if (v.password !== v.confirm) return say("Passwords do not match.");
    const { data, error } = await sb.auth.signUp({
      email: v.email,
      password: v.password,
      options: {
        data: {
          full_name: [v.first, v.mi ? v.mi.replace(/\.?$/, ".") : "", v.last]
            .filter(Boolean)
            .join(" "),
          first_name: v.first,
          last_name: v.last,
          middle_initial: v.mi || "",
        },
      },
    });
    if (error) return say(error.message);
    if (!data.session)
      say(
        "Account created. Check your email for a confirmation link, then log in.",
        0,
      );
  } else {
    const { error } = await sb.auth.signInWithPassword({
      email: v.email,
      password: v.password,
    });
    if (error) say(error.message);
  }
}
async function authSubmit(e) {
  const v = F(e),
    b = e.target.querySelector("button");
  b.disabled = true;
  await doAuth(v);
  b.disabled = false;
}
async function forgot() {
  if (!sb)
    return say(
      "Preview only. Add your Supabase keys in config.js to turn on real accounts.",
    );
  const em = document.querySelector("#auth input[name=email]").value;
  if (!em) return say("Type your email above first.");
  const { error } = await sb.auth.resetPasswordForEmail(em, {
    redirectTo: location.origin + location.pathname,
  });
  error
    ? say(error.message)
    : say("Password reset link sent. Check your email.", 0);
}
async function logout() {
  if (sb) await sb.auth.signOut();
}
function render() {
  const pv = !sb && /^#(login|signup)$/.test(location.hash);
  if (recovering) {
    showAuth("reset");
    return;
  }
  if (pv || (sb && !USER)) {
    showAuth(pv && location.hash == "#signup" ? "signup" : authMode);
    return;
  }
  $("#auth").hidden = true;
  document.querySelector(".frame").hidden = false;
  go();
}
if (sb)
  sb.auth.onAuthStateChange(async (ev, ses) => {
    const u = ses ? ses.user : null;
    if (ev == "PASSWORD_RECOVERY") {
      USER = u;
      recovering = true;
      return render();
    }
    if ((u && !USER) || (!u && USER)) {
      USER = u;
      if (u) await load();
      else T.forEach((t) => (D[t] = []));
      render();
    }
  });
$("#share").innerHTML = SH;
window.addEventListener("hashchange", () => {
  render();
  window.scrollTo(0, 0);
});
$("#view").innerHTML = '<div class="card">Loading data…</div>';
load().then(render);
