/* =========================================================
   術前休薬チェッカー - app.js
   ---------------------------------------------------------
   この下にある DRUG_DB を編集することで、対象薬剤・休薬期間
   を追加・修正できます。各施設のプロトコルに合わせて
   調整してください。
   ========================================================= */

// 薬効分類とテーマカラー
const CATEGORIES = {
  antiplatelet:  { label: "抗血小板薬",            color: "#D9663B" },
  anticoagulant: { label: "抗凝固薬",              color: "#C0392B" },
  circulation:   { label: "末梢循環・脳循環改善薬", color: "#8C6E4A" },
  diabetes:      { label: "糖尿病治療薬",          color: "#2E6E8E" },
  hormone:       { label: "ホルモン剤",            color: "#7C5295" },
  supplement:    { label: "サプリメント・健康食品", color: "#5B8C5A" },
};

/*
  各エントリの days は「手術何日前から休薬するか」の代表値です。
  0 の場合は「手術当日の朝の内服のみ中止」を意味します。
  verify:true の薬剤は、ガイドラインや施設プロトコルにより
  値が異なることが多いため、画面上に要確認の表示をします。
*/
const DRUG_DB = [
  // ---- 抗血小板薬 ----
  {
    id: "aspirin", generic: "アスピリン",
    brands: ["バイアスピリン", "バファリンA81", "タケルダ配合錠", "ゼンアスピリン"],
    category: "antiplatelet", days: 7,
    note: "出血リスクのため、術前7日間の休薬が一般的な目安です。緊急手術では中止せず対応する場合もあります。"
  },
  {
    id: "clopidogrel", generic: "クロピドグレル",
    brands: ["プラビックス", "コンプラビン配合錠"],
    category: "antiplatelet", days: 14,
    note: "院内基準では術前14日間の休薬とされています(添付文書上も14日間)。"
  },
  {
    id: "prasugrel", generic: "プラスグレル",
    brands: ["エフィエント"],
    category: "antiplatelet", days: 14,
    note: "添付文書では14日間の休薬が推奨されています。手術の種類により短縮可能な場合もあるため要確認です。",
    verify: true
  },
  {
    id: "ticlopidine", generic: "チクロピジン",
    brands: ["パナルジン"],
    category: "antiplatelet", days: 10,
    note: "10〜14日間の休薬が一般的とされています。",
    verify: true
  },
  {
    id: "cilostazol", generic: "シロスタゾール",
    brands: ["プレタール"],
    category: "antiplatelet", days: 3,
    note: ""
  },
  {
    id: "sarpogrelate", generic: "サルポグレラート",
    brands: ["アンプラーグ"],
    category: "antiplatelet", days: 1,
    note: "血小板機能への影響は他の抗血小板薬より弱いとされ、1日程度の休薬が目安です。"
  },
  {
    id: "epa", generic: "イコサペント酸エチル",
    brands: ["エパデール", "エパデールS"],
    category: "antiplatelet", days: 7,
    note: "出血リスク増大の報告があり、7〜10日間の休薬が提案されています。",
    verify: true
  },
  {
    id: "dipyridamole", generic: "ジピリダモール",
    brands: ["ペルサンチン", "コメリアン"],
    category: "antiplatelet", days: 2,
    note: "出血リスクへの影響は限定的とされますが、2日程度の休薬が一般的です。"
  },
  {
    id: "omega3_epadha", generic: "オメガ3脂肪酸エチル(EPA/DHA配合)",
    brands: ["ロトリガ"],
    category: "antiplatelet", days: 7,
    note: "イコサペント酸エチル(エパデール)と同様、抗血小板作用により出血リスクが高まるため、術前7日間の休薬が目安です。"
  },
  {
    id: "ticagrelor", generic: "チカグレロル",
    brands: ["ブリリンタ"],
    category: "antiplatelet", days: 5,
    note: "P2Y12受容体拮抗薬。術前5日間の休薬が目安です。"
  },

  // ---- 抗凝固薬 ----
  {
    id: "warfarin", generic: "ワルファリン",
    brands: ["ワーファリン"],
    category: "anticoagulant", days: 3,
    note: "院内基準では術前48〜72時間の休薬とされています。PT-INRを確認し、血栓リスクに応じてヘパリン置換を検討してください。"
  },
  {
    id: "dabigatran", generic: "ダビガトラン",
    brands: ["プラザキサ"],
    category: "anticoagulant", days: 2,
    note: "腎機能(CCr)と出血リスクにより中止期間が異なります。下表を参考に、最終内服のタイミングを確認してください。",
    renalTable: {
      title: "腎機能(CCr)・出血リスク別の中止期間(最終内服からの時間)",
      rows: [
        { ccr: "CCr > 80", halfLife: "約13時間", standard: "24時間", high: "2〜4日" },
        { ccr: "50 < CCr ≦ 80", halfLife: "約15時間", standard: "24時間", high: "2〜4日" },
        { ccr: "30 < CCr ≦ 50", halfLife: "約18時間", standard: "少なくとも2日", high: "4日" },
      ],
      note: "腎機能低下例(CCr≦30)はさらに延長が必要です。半減期は目安であり、個人差があります。"
    }
  },
  {
    id: "rivaroxaban", generic: "リバーロキサバン",
    brands: ["イグザレルト"],
    category: "anticoagulant", days: 1,
    note: "通常、前日からの中止(24時間以上前)が目安です。"
  },
  {
    id: "apixaban", generic: "アピキサバン",
    brands: ["エリキュース"],
    category: "anticoagulant", days: 2,
    note: "通常1〜2日前からの中止が目安です。"
  },
  {
    id: "edoxaban", generic: "エドキサバン",
    brands: ["リクシアナ"],
    category: "anticoagulant", days: 1,
    note: "通常、前日からの中止(24時間以上前)が目安です。"
  },

  // ---- 末梢循環・脳循環改善薬 ----
  {
    id: "limaprost", generic: "リマプロストアルファデクス",
    brands: ["オパルモン", "プロレナール"],
    category: "circulation", days: 0, noRestriction: true,
    note: "作用持続時間は4〜6時間と短く、複数日にわたる休薬は通常不要とされています。手術当日の内服タイミングは施設の運用に従ってください。"
  },
  {
    id: "ibudilast", generic: "イブジラスト",
    brands: ["ケタス"],
    category: "circulation", days: 3,
    note: "抗血小板作用があり、術前3日間の休薬が目安です。"
  },
  {
    id: "trapidil", generic: "トラピジル",
    brands: ["ロコルナール"],
    category: "circulation", days: 2,
    note: "抗血小板作用があり、術前2日間の休薬が目安です。"
  },
  {
    id: "ifenprodil", generic: "イフェンプロジル",
    brands: ["セロクラール"],
    category: "circulation", days: 1,
    note: "術前1日間の休薬が目安です。低出血リスクの内視鏡検査では休薬なしで施行可能とされています。"
  },

  // ---- 糖尿病治療薬 (SGLT2阻害薬) ----
  {
    id: "dapagliflozin", generic: "ダパグリフロジン",
    brands: ["フォシーガ"],
    category: "diabetes", days: 3,
    note: "周術期の糖尿病性ケトアシドーシス予防のため、術前3日間の休薬が推奨されています。"
  },
  {
    id: "empagliflozin", generic: "エンパグリフロジン",
    brands: ["ジャディアンス", "ジェミーナ配合錠", "トラディアンス配合錠"],
    category: "diabetes", days: 3,
    note: "周術期の糖尿病性ケトアシドーシス予防のため、術前3日間の休薬が推奨されています。配合錠に含まれるDPP-4阻害薬成分は通常、休薬の必要はありません。"
  },
  {
    id: "ipragliflozin", generic: "イプラグリフロジン",
    brands: ["スーグラ"],
    category: "diabetes", days: 3,
    note: "周術期の糖尿病性ケトアシドーシス予防のため、術前3日間の休薬が推奨されています。"
  },
  {
    id: "canagliflozin", generic: "カナグリフロジン",
    brands: ["カナグル", "カナリア配合錠"],
    category: "diabetes", days: 3,
    note: "周術期の糖尿病性ケトアシドーシス予防のため、術前3日間の休薬が推奨されています。配合錠に含まれるDPP-4阻害薬成分は通常、休薬の必要はありません。"
  },
  {
    id: "luseogliflozin", generic: "ルセオグリフロジン",
    brands: ["ルセフィ"],
    category: "diabetes", days: 3,
    note: "周術期の糖尿病性ケトアシドーシス予防のため、術前3日間の休薬が推奨されています。"
  },
  {
    id: "tofogliflozin", generic: "トホグリフロジン",
    brands: ["デベルザ", "アプルウェイ"],
    category: "diabetes", days: 3,
    note: "周術期の糖尿病性ケトアシドーシス予防のため、術前3日間の休薬が推奨されています。"
  },

  // ---- 糖尿病治療薬 (当日朝中止) ----
  {
    id: "metformin", generic: "メトホルミン",
    brands: ["メトグルコ", "グリコラン", "イニシンク配合錠", "エクメット配合錠HD", "エクメット配合錠LD", "メタクト配合錠", "メトアナ配合錠"],
    category: "diabetes", days: 2,
    note: "院内基準では術前後48時間の休薬とされています(腎機能正常時)。腎機能低下例やヨード造影剤使用時はさらに注意が必要です。配合錠に含まれるDPP-4阻害薬・チアゾリジン系成分は通常、休薬の必要はありません。"
  },
  {
    id: "glimepiride", generic: "グリメピリド",
    brands: ["アマリール"],
    category: "diabetes", days: 0,
    note: "低血糖予防のため、手術当日の朝から中止します。"
  },
  {
    id: "gliclazide", generic: "グリクラジド",
    brands: ["グリミクロン"],
    category: "diabetes", days: 0,
    note: "低血糖予防のため、手術当日の朝から中止します。"
  },
  {
    id: "glinide", generic: "グリニド系薬剤",
    brands: ["シュアポスト", "ファスティック", "スターシス", "グルファスト"],
    category: "diabetes", days: 0,
    note: "低血糖予防のため、手術当日の朝から中止します。"
  },
  {
    id: "glp1", generic: "GLP-1受容体作動薬",
    brands: ["ビクトーザ", "オゼンピック", "リベルサス", "トルリシティ", "マンジャロ"],
    category: "diabetes", days: 7,
    note: "消化管運動抑制による誤嚥リスクが議論されており、特に週1回製剤では1週間程度の間隔をあけることが提案されています。エビデンスは発展中のため施設プロトコルの確認が必須です。",
    verify: true
  },

  // ---- ホルモン剤 ----
  {
    id: "oc", generic: "経口避妊薬(エストロゲン含有)",
    brands: ["プラノバール", "ヤーズ", "ルナベル", "ファボワール", "マーベロン"],
    category: "hormone", days: 28,
    note: "静脈血栓塞栓症リスク低減のため、可能であれば手術の4週間前からの中止を検討します。中止が困難な場合は血栓予防策の強化を検討してください。",
    verify: true
  },
  {
    id: "hrt", generic: "ホルモン補充療法(エストロゲン製剤)",
    brands: ["プレマリン", "ジュリナ", "エストラーナ", "ディビゲル"],
    category: "hormone", days: 28,
    note: "静脈血栓塞栓症リスクを考慮し4週間前からの中止が検討されますが、更年期症状への影響も含め個別に判断します。",
    verify: true
  },
  {
    id: "raloxifene", generic: "ラロキシフェン",
    brands: ["エビスタ"],
    category: "hormone", days: 3,
    note: "SERM製剤。静脈血栓塞栓症リスクのため、術前3日間の休薬が目安です。"
  },
  {
    id: "bazedoxifene", generic: "バゼドキシフェン",
    brands: ["ビビアント"],
    category: "hormone", days: 3,
    note: "SERM製剤。静脈血栓塞栓症リスクのため、術前3日間の休薬が目安です。"
  },

  // ---- サプリメント・健康食品 ----
  {
    id: "ginkgo", generic: "イチョウ葉エキス",
    brands: ["イチョウ葉", "ギンコ"],
    category: "supplement", days: 7,
    note: "抗血小板作用が報告されており、1週間前からの中止が望ましいとされています。"
  },
  {
    id: "garlic", generic: "ニンニク高用量サプリメント",
    brands: ["ニンニクエキス", "ガーリック"],
    category: "supplement", days: 7,
    note: "抗血小板作用が報告されており、1週間前からの中止が望ましいとされています。"
  },
  {
    id: "vite", generic: "高用量ビタミンE",
    brands: ["ビタミンE"],
    category: "supplement", days: 7,
    note: "高用量摂取時は出血リスクとの関連が報告されており、1週間前からの中止が望ましいとされています。"
  },
  {
    id: "fishoil", generic: "EPA/DHA高用量サプリメント(フィッシュオイル)",
    brands: ["フィッシュオイル", "オメガ3サプリ"],
    category: "supplement", days: 7,
    note: "高用量摂取時は出血傾向に関連するとされ、1週間前からの中止が望ましいとされています。"
  },
  {
    id: "ginseng", generic: "高麗人参・朝鮮人参(ジンセン)",
    brands: ["朝鮮人参", "高麗人参", "ジンセン", "ニンジン"],
    category: "supplement", days: 7,
    note: "抗血小板作用および血糖低下作用が報告されており、1週間前からの中止が望ましいとされています。"
  },
  {
    id: "kava", generic: "カバ",
    brands: ["カバカバ"],
    category: "supplement", days: 1,
    note: "鎮静作用があり麻酔薬の作用を増強する可能性があるため、1日(24時間)前からの中止が望ましいとされています。長期使用による肝障害の報告もあります。"
  },
  {
    id: "stjohnswort", generic: "セントジョーンズワート",
    brands: ["セイヨウオトギリソウ"],
    category: "supplement", days: 5,
    note: "薬物代謝酵素を誘導し、麻酔薬や免疫抑制薬など多くの薬剤の作用に影響する可能性があるため、5日前からの中止が望ましいとされています。"
  },
  {
    id: "ephedra", generic: "エフェドラ(マオウ)",
    brands: ["麻黄"],
    category: "supplement", days: 1,
    note: "交感神経刺激作用により不整脈や血圧上昇などのリスクがあり、1日(24時間)前からの中止が望ましいとされています。"
  },
  {
    id: "echinacea", generic: "エキナセア",
    brands: [],
    category: "supplement", noDefinedPeriod: true,
    note: "免疫系への影響が報告されており、長期使用時は他剤(免疫抑制薬等)の作用に影響する可能性があります。可能であれば術前に中止することが望ましいとされています。"
  },
  {
    id: "valerian", generic: "バレリアン(セイヨウカノコソウ)",
    brands: [],
    category: "supplement", noDefinedPeriod: true,
    note: "鎮静作用があり麻酔薬の作用に影響する可能性があります。急な中止により離脱症状様の症状が出る可能性があるため、可能であれば漸減を検討してください。"
  },
  {
    id: "feverfew", generic: "フィーバーフュー(ナツシロギク)",
    brands: [],
    category: "supplement", noDefinedPeriod: true,
    note: "抗血小板作用が報告されており、出血リスクの観点から可能であれば術前に中止することが望ましいとされています。"
  },
  {
    id: "aloe", generic: "アロエ(内服)",
    brands: [],
    category: "supplement", noDefinedPeriod: true,
    note: "下剤様作用による電解質異常や、血糖低下作用が報告されており、周術期管理への影響に注意が必要です。"
  },
  {
    id: "sawpalmetto", generic: "ノコギリヤシ",
    brands: [],
    category: "supplement", noDefinedPeriod: true,
    note: "軽度の抗血小板作用が報告されており、出血リスクの観点から可能であれば術前に中止することが望ましいとされています。"
  },
  {
    id: "ginger", generic: "ジンジャー(ショウガ・高用量サプリメント)",
    brands: [],
    category: "supplement", noDefinedPeriod: true,
    note: "高用量摂取時は軽度の抗血小板作用が報告されています。通常の食事量であれば特に問題ないとされています。"
  },
];

/* =========================================================
   テキスト正規化・マッチング
   ========================================================= */

// 全角/半角統一・空白除去・用量表記(数字やmg等)除去
function normalizeForMatch(s) {
  if (!s) return "";
  return s
    .normalize("NFKC")
    .replace(/[\s　]/g, "")
    .replace(/[0-9]+(\.[0-9]+)?(mg|ｍｇ|g|ｇ|mcg|μg|ml|ｍｌ)?/gi, "")
    .replace(/[（）()「」『』,.、。/／\-]/g, "");
}

// レーベンシュタイン距離(あいまい一致用)
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// OCRテキストに対して薬剤DBを照合する
// 戻り値: { exact: [{drug, matchedName}], fuzzy: [{drug, matchedName, candidate}] }
function matchDrugs(ocrText) {
  const normalized = normalizeForMatch(ocrText);
  const exact = [];
  const fuzzy = [];
  const exactIds = new Set();

  for (const drug of DRUG_DB) {
    const names = [drug.generic, ...drug.brands];
    let found = false;
    let bestMatch = null; // 最も長く一致した名称を採用(より具体的な表記を優先)

    for (const name of names) {
      const normName = normalizeForMatch(name);
      if (normName.length >= 2 && normalized.includes(normName)) {
        if (!bestMatch || normName.length > normalizeForMatch(bestMatch).length) {
          bestMatch = name;
        }
        found = true;
      }
    }
    if (found) {
      exact.push({ drug, matchedName: bestMatch });
      exactIds.add(drug.id);
      continue;
    }

    // あいまい一致(OCR誤読対策): 長さ5文字以上の名称のみ対象
    for (const name of names) {
      const normName = normalizeForMatch(name);
      if (normName.length < 5) continue;
      const winLen = normName.length;
      let bestDist = Infinity;
      let bestSlice = "";
      for (let i = 0; i + winLen - 1 <= normalized.length; i++) {
        for (const w of [winLen - 1, winLen, winLen + 1]) {
          if (w <= 0) continue;
          const slice = normalized.slice(i, i + w);
          if (!slice) continue;
          const dist = levenshtein(normName, slice);
          if (dist < bestDist) {
            bestDist = dist;
            bestSlice = slice;
          }
        }
      }
      const threshold = normName.length <= 6 ? 1 : 2;
      if (bestDist > 0 && bestDist <= threshold) {
        fuzzy.push({ drug, matchedName: name, candidate: bestSlice, distance: bestDist });
        break;
      }
    }
  }

  return { exact, fuzzy };
}

/* =========================================================
   日付計算
   ========================================================= */

function getStopDate(surgeryDateStr, days) {
  if (!surgeryDateStr) return null;
  const d = new Date(surgeryDateStr + "T00:00:00");
  d.setDate(d.getDate() - days);
  return d;
}

function formatDate(d) {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function startOfDay(d) {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

/* =========================================================
   UI レンダリング
   ========================================================= */

const $ = (sel) => document.querySelector(sel);

function timingLabel(drug) {
  if (drug.noRestriction) return "特別な休薬は通常不要";
  if (drug.noDefinedPeriod) return "明確な休薬期間の定めなし(可能であれば術前に中止が望ましい)";
  if (drug.days === 0) return "手術当日の朝から中止";
  if (drug.days % 7 === 0) return `手術 ${drug.days / 7} 週間前から中止`;
  return `手術 ${drug.days} 日前から中止`;
}

function renderRenalTable(drug) {
  if (!drug.renalTable) return "";
  const rows = drug.renalTable.rows.map((r) => `
    <tr>
      <td>${r.ccr}</td>
      <td>${r.halfLife}</td>
      <td>${r.standard}</td>
      <td>${r.high}</td>
    </tr>
  `).join("");

  return `
    <div class="renal-table-wrap">
      <p class="renal-table-title">${drug.renalTable.title}</p>
      <table class="renal-table">
        <thead>
          <tr>
            <th>腎機能(CCr)</th>
            <th>半減期(目安)</th>
            <th>出血リスク標準</th>
            <th>出血リスク高</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="renal-table-note">${drug.renalTable.note || ""}</p>
    </div>
  `;
}

function renderDrugCard({ drug, matchedName }, surgeryDateStr, isFuzzy = false, fuzzyInfo = null) {
  const cat = CATEGORIES[drug.category];
  const stopDate = (surgeryDateStr && typeof drug.days === "number")
    ? getStopDate(surgeryDateStr, drug.days)
    : null;

  let timelineHtml = "";
  if (stopDate && !drug.noRestriction) {
    const today = startOfDay(new Date());
    const diffDays = Math.round((stopDate - today) / 86400000);
    let status, statusClass;
    if (diffDays < 0) {
      status = `休薬開始予定日(${formatDate(stopDate)})を過ぎています。至急ご確認ください。`;
      statusClass = "status-overdue";
    } else if (diffDays === 0) {
      status = `本日(${formatDate(stopDate)})が休薬開始日です。`;
      statusClass = "status-today";
    } else {
      status = `休薬開始日: ${formatDate(stopDate)}(あと ${diffDays} 日)`;
      statusClass = "status-ok";
    }
    timelineHtml = `<div class="timeline ${statusClass}">${status}</div>`;
  }

  const fuzzyBadge = isFuzzy
    ? `<span class="badge badge-fuzzy">類似一致 (OCR読み取り「${fuzzyInfo.candidate}」)</span>`
    : "";
  const verifyBadge = drug.verify
    ? `<span class="badge badge-verify">⚠ 施設プロトコル要確認</span>`
    : "";

  return `
    <div class="drug-card" style="border-left-color: ${cat.color}">
      <div class="drug-card-head">
        <span class="cat-badge" style="background:${cat.color}">${cat.label}</span>
        ${fuzzyBadge}${verifyBadge}
      </div>
      <h3>${drug.generic}</h3>
      <p class="brand-name">手帳の表記: ${matchedName}</p>
      <p class="timing">${timingLabel(drug)}</p>
      ${timelineHtml}
      ${renderRenalTable(drug)}
      ${drug.note ? `<p class="note">${drug.note}</p>` : ""}
    </div>
  `;
}

function renderResults(matchResult, surgeryDateStr) {
  const { exact, fuzzy } = matchResult;
  const resultsSection = $("#resultsSection");
  const matchedEl = $("#matchedDrugs");
  const fuzzyEl = $("#fuzzyDrugs");

  resultsSection.hidden = false;

  if (exact.length === 0) {
    matchedEl.innerHTML = `<div class="empty-state">登録されている休薬対象薬は見つかりませんでした。読み取り結果に薬剤名が正しく含まれているかご確認ください。</div>`;
  } else {
    matchedEl.innerHTML = `<h3 class="section-title">休薬が必要な可能性がある薬剤(${exact.length}件)</h3>` +
      exact.map((m) => renderDrugCard(m, surgeryDateStr)).join("");
  }

  if (fuzzy.length === 0) {
    fuzzyEl.innerHTML = "";
  } else {
    fuzzyEl.innerHTML = `<h3 class="section-title">類似する薬剤名が見つかりました(OCR誤読の可能性、要確認・${fuzzy.length}件)</h3>` +
      fuzzy.map((m) => renderDrugCard(m, surgeryDateStr, true, m)).join("");
  }

  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderDbList() {
  const el = $("#dbList");
  const grouped = {};
  for (const drug of DRUG_DB) {
    grouped[drug.category] = grouped[drug.category] || [];
    grouped[drug.category].push(drug);
  }
  let html = "";
  for (const [catKey, drugs] of Object.entries(grouped)) {
    const cat = CATEGORIES[catKey];
    html += `<div class="db-group"><h4 style="color:${cat.color}">${cat.label}</h4><ul>`;
    for (const d of drugs) {
      const brandText = d.brands.length ? `(${d.brands.join("・")})` : "";
      html += `<li><strong>${d.generic}</strong>${brandText} — ${timingLabel(d)}</li>`;
    }
    html += `</ul></div>`;
  }
  el.innerHTML = html;
}

/* =========================================================
   検索(手動追加)
   ========================================================= */

function renderSearchResults(query) {
  const el = $("#searchResults");
  if (!query || query.trim().length < 1) {
    el.innerHTML = "";
    return;
  }
  const normQuery = normalizeForMatch(query);
  const matches = [];
  for (const drug of DRUG_DB) {
    const names = [drug.generic, ...drug.brands];
    for (const name of names) {
      if (normalizeForMatch(name).includes(normQuery)) {
        matches.push({ drug, matchedName: name });
        break;
      }
    }
  }
  if (matches.length === 0) {
    el.innerHTML = `<div class="empty-state-small">該当する薬剤は見つかりませんでした。</div>`;
    return;
  }
  el.innerHTML = matches.slice(0, 8).map((m) => {
    const cat = CATEGORIES[m.drug.category];
    return `<button class="search-result-item" data-id="${m.drug.id}" data-name="${m.matchedName}" style="border-left-color:${cat.color}">
      <strong>${m.drug.generic}</strong>(${m.matchedName}) — ${timingLabel(m.drug)}
    </button>`;
  }).join("");
}

/* =========================================================
   画像処理(回転・範囲選択・二値化)
   ========================================================= */

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

// クロップ操作の状態
const cropState = {
  sourceCanvas: null, // 回転後の元画像(フル解像度)
};
let cropRect = null;   // {x, y, w, h} … クロップ枠(表示上のCSS px、cropContainer基準)
let cropDrag = null;    // ドラッグ中の情報

// 画像ファイルをcanvasに読み込む(長辺2600pxを上限にリサイズ)
async function loadFileToCanvas(file) {
  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = URL.createObjectURL(file);
  });

  const maxDim = 2600;
  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(img, 0, 0, width, height);
  return canvas;
}

// canvasを90度回転した新しいcanvasを返す
function rotateCanvas90(src, clockwise) {
  const dst = document.createElement("canvas");
  dst.width = src.height;
  dst.height = src.width;
  const ctx = dst.getContext("2d");
  if (clockwise) {
    ctx.translate(dst.width, 0);
    ctx.rotate(Math.PI / 2);
  } else {
    ctx.translate(0, dst.height);
    ctx.rotate(-Math.PI / 2);
  }
  ctx.drawImage(src, 0, 0);
  return dst;
}

// グレースケール化 + 大津の二値化(自動でコントラストを最大化)
function binarizeOtsu(imageData) {
  const data = imageData.data;
  const n = data.length / 4;
  const gray = new Uint8ClampedArray(n);
  const hist = new Array(256).fill(0);

  for (let i = 0; i < n; i++) {
    const idx = i * 4;
    const g = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    gray[i] = g;
    hist[Math.round(g)]++;
  }

  let sumAll = 0;
  for (let t = 0; t < 256; t++) sumAll += t * hist[t];

  let sumB = 0, wB = 0, best = -1, threshold = 127;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = n - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sumAll - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > best) {
      best = between;
      threshold = t;
    }
  }

  for (let i = 0; i < n; i++) {
    const v = gray[i] > threshold ? 255 : 0;
    const idx = i * 4;
    data[idx] = data[idx + 1] = data[idx + 2] = v;
  }
}

// 選択中の画像をプレビューcanvasに描画
function drawPreview() {
  const canvas = $("#previewCanvas");
  canvas.width = cropState.sourceCanvas.width;
  canvas.height = cropState.sourceCanvas.height;
  canvas.getContext("2d").drawImage(cropState.sourceCanvas, 0, 0);
}

// クロップ枠を画像全体に近い初期位置(上下左右4%マージン)にリセット
function resetCropRect() {
  requestAnimationFrame(() => {
    const rect = $("#cropContainer").getBoundingClientRect();
    const mx = rect.width * 0.04;
    const my = rect.height * 0.04;
    cropRect = {
      x: mx, y: my,
      w: Math.max(20, rect.width - mx * 2),
      h: Math.max(20, rect.height - my * 2),
    };
    updateCropBoxDom();
  });
}

function updateCropBoxDom() {
  const box = $("#cropBox");
  box.style.left = `${cropRect.x}px`;
  box.style.top = `${cropRect.y}px`;
  box.style.width = `${cropRect.w}px`;
  box.style.height = `${cropRect.h}px`;
}

function onCropPointerDown(e, type) {
  e.preventDefault();
  const containerRect = $("#cropContainer").getBoundingClientRect();
  cropDrag = {
    type,
    startX: e.clientX,
    startY: e.clientY,
    startRect: { ...cropRect },
    containerRect,
  };
  document.addEventListener("pointermove", onCropPointerMove);
  document.addEventListener("pointerup", onCropPointerUp);
}

function onCropPointerMove(e) {
  if (!cropDrag) return;
  const dx = e.clientX - cropDrag.startX;
  const dy = e.clientY - cropDrag.startY;
  const { x, y, w, h } = cropDrag.startRect;
  const cw = cropDrag.containerRect.width;
  const ch = cropDrag.containerRect.height;
  const min = 32;

  let nx = x, ny = y, nw = w, nh = h;
  switch (cropDrag.type) {
    case "move":
      nx = clamp(x + dx, 0, cw - w);
      ny = clamp(y + dy, 0, ch - h);
      break;
    case "nw":
      nx = clamp(x + dx, 0, x + w - min);
      ny = clamp(y + dy, 0, y + h - min);
      nw = x + w - nx;
      nh = y + h - ny;
      break;
    case "ne":
      nw = clamp(w + dx, min, cw - x);
      ny = clamp(y + dy, 0, y + h - min);
      nh = y + h - ny;
      break;
    case "sw":
      nx = clamp(x + dx, 0, x + w - min);
      nw = x + w - nx;
      nh = clamp(h + dy, min, ch - y);
      break;
    case "se":
      nw = clamp(w + dx, min, cw - x);
      nh = clamp(h + dy, min, ch - y);
      break;
  }
  cropRect = { x: nx, y: ny, w: nw, h: nh };
  updateCropBoxDom();
}

function onCropPointerUp() {
  cropDrag = null;
  document.removeEventListener("pointermove", onCropPointerMove);
  document.removeEventListener("pointerup", onCropPointerUp);
}

// クロップ枠の範囲を元画像から切り出し、二値化したdataURLを返す
function extractCroppedDataUrl() {
  const containerRect = $("#cropContainer").getBoundingClientRect();
  const scaleX = cropState.sourceCanvas.width / containerRect.width;
  const scaleY = cropState.sourceCanvas.height / containerRect.height;

  const sx = Math.round(cropRect.x * scaleX);
  const sy = Math.round(cropRect.y * scaleY);
  const sw = Math.max(1, Math.round(cropRect.w * scaleX));
  const sh = Math.max(1, Math.round(cropRect.h * scaleY));

  // 範囲が小さい場合は拡大してOCR精度を上げる(最大3倍)
  const targetMin = 1000;
  const upscale = Math.max(sw, sh) < targetMin
    ? Math.min(3, targetMin / Math.max(sw, sh))
    : 1;
  const outW = Math.max(1, Math.round(sw * upscale));
  const outH = Math.max(1, Math.round(sh * upscale));

  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  const ctx = out.getContext("2d");
  ctx.drawImage(cropState.sourceCanvas, sx, sy, sw, sh, 0, 0, outW, outH);

  const imageData = ctx.getImageData(0, 0, outW, outH);
  binarizeOtsu(imageData);
  ctx.putImageData(imageData, 0, 0);

  return out.toDataURL("image/png");
}

/* =========================================================
   OCR実行
   ========================================================= */

let ocrWorker = null;

// Tesseractワーカーを作成・再利用する(範囲を一様なブロックとして読み取るモードに設定)
async function getOcrWorker(logger) {
  if (!ocrWorker) {
    ocrWorker = await Tesseract.createWorker("jpn", undefined, { logger });
    try {
      await ocrWorker.setParameters({ tessedit_pageseg_mode: "6" });
    } catch (e) {
      console.warn("setParameters failed (続行します):", e);
    }
  }
  return ocrWorker;
}

async function recognizeText(dataUrl, logger) {
  try {
    const worker = await getOcrWorker(logger);
    const { data } = await worker.recognize(dataUrl);
    return data.text || "";
  } catch (err) {
    console.warn("ワーカーでの認識に失敗したため簡易モードで再試行します:", err);
    const { data } = await Tesseract.recognize(dataUrl, "jpn", { logger });
    return data.text || "";
  }
}

/* =========================================================
   イベント設定
   ========================================================= */

function setProgress(percent, label) {
  const wrap = $("#ocrProgress");
  const bar = $("#ocrProgressBar");
  const text = $("#ocrProgressText");
  wrap.hidden = false;
  bar.style.width = `${Math.round(percent * 100)}%`;
  text.textContent = label;
}

function hideProgress() {
  $("#ocrProgress").hidden = true;
}

// 画像が選択されたら、回転・範囲選択UIを表示する(OCRはまだ実行しない)
async function handleImageSelected(file) {
  if (!file) return;

  $("#cropArea").hidden = true;

  try {
    cropState.sourceCanvas = await loadFileToCanvas(file);
    drawPreview();
    $("#cropArea").hidden = false;
    resetCropRect();
  } catch (err) {
    console.error(err);
    alert("画像の読み込みに失敗しました。もう一度お試しください。");
  }
}

function rotateImage(clockwise) {
  if (!cropState.sourceCanvas) return;
  cropState.sourceCanvas = rotateCanvas90(cropState.sourceCanvas, clockwise);
  drawPreview();
  resetCropRect();
}

// 選択中の範囲でOCRを実行し、結果をテキスト欄に追記する
async function runOcrOnCrop() {
  if (!cropState.sourceCanvas || !cropRect) return;

  const runBtn = $("#runOcrBtn");
  runBtn.disabled = true;
  setProgress(0, "選択範囲を処理しています…");

  try {
    const dataUrl = extractCroppedDataUrl();
    const text = await recognizeText(dataUrl, (m) => {
      if (m.status === "recognizing text") {
        setProgress(m.progress, `文字を読み取っています… ${Math.round(m.progress * 100)}%`);
      } else if (m.status) {
        setProgress(0.02, "準備中: " + m.status);
      }
    });

    const trimmed = text.trim();
    const ta = $("#ocrText");
    ta.value = ta.value.trim() ? `${ta.value.trim()}\n${trimmed}` : trimmed;
    hideProgress();
  } catch (err) {
    console.error(err);
    hideProgress();
    alert("文字の読み取り中にエラーが発生しました。範囲を変えるか、薬剤名を直接入力してください。");
  } finally {
    runBtn.disabled = false;
  }
}

function addManualDrug(drug, matchedName) {
  const surgeryDateStr = $("#surgeryDate").value;
  const resultsSection = $("#resultsSection");
  resultsSection.hidden = false;

  const matchedEl = $("#matchedDrugs");
  if (matchedEl.querySelector(".empty-state")) {
    matchedEl.innerHTML = `<h3 class="section-title">休薬が必要な可能性がある薬剤</h3>`;
  }
  if (!matchedEl.querySelector(".section-title")) {
    matchedEl.innerHTML = `<h3 class="section-title">休薬が必要な可能性がある薬剤</h3>` + matchedEl.innerHTML;
  }
  matchedEl.insertAdjacentHTML("beforeend", renderDrugCard({ drug, matchedName }, surgeryDateStr));
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function init() {
  renderDbList();

  $("#imageInput").addEventListener("change", (e) => {
    handleImageSelected(e.target.files[0]);
    // 同じファイルを選び直したときも change が発火するようにリセット
    e.target.value = "";
  });

  $("#rotateLeftBtn").addEventListener("click", () => rotateImage(false));
  $("#rotateRightBtn").addEventListener("click", () => rotateImage(true));
  $("#runOcrBtn").addEventListener("click", runOcrOnCrop);

  $("#cropBox").addEventListener("pointerdown", (e) => {
    const handle = e.target.closest(".crop-handle");
    onCropPointerDown(e, handle ? handle.dataset.handle : "move");
  });

  $("#clearTextBtn").addEventListener("click", () => {
    $("#ocrText").value = "";
  });

  $("#checkBtn").addEventListener("click", () => {
    const text = $("#ocrText").value;
    if (!text.trim()) {
      alert("読み取り結果が空です。写真を選択するか、薬剤名を入力してください。");
      return;
    }
    const surgeryDateStr = $("#surgeryDate").value;
    const result = matchDrugs(text);
    renderResults(result, surgeryDateStr);
  });

  $("#drugSearch").addEventListener("input", (e) => {
    renderSearchResults(e.target.value);
  });

  $("#searchResults").addEventListener("click", (e) => {
    const btn = e.target.closest(".search-result-item");
    if (!btn) return;
    const drug = DRUG_DB.find((d) => d.id === btn.dataset.id);
    if (drug) addManualDrug(drug, btn.dataset.name);
    $("#drugSearch").value = "";
    $("#searchResults").innerHTML = "";
  });

  $("#surgeryDate").addEventListener("change", () => {
    // 日付変更時、既存の結果があれば再描画(再チェック)
    const text = $("#ocrText").value;
    if (text.trim() && !$("#resultsSection").hidden) {
      const result = matchDrugs(text);
      renderResults(result, $("#surgeryDate").value);
    }
  });
}

document.addEventListener("DOMContentLoaded", init);

// オフライン利用のためサービスワーカーを登録
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  });
}
