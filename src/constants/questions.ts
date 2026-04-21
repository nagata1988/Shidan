export const QUESTIONS_DATA = {
  "version": "0.3",
  "questions": [
    { "id": "industries", "type": "industry_multi_select", "text": "貴社の業種・事業内容をすべて選択してください", "hint": "複数事業を営む場合はすべて選択できます。\n\n🤔 迷ったときの判断ルール：「売上3割の法則」\n付帯的な事業が売上の3割以上なら、別業種として追加選択してください。\n　✅ 3割以上 → 両方を選択（独立したリスクとして評価）\n　❌ 3割未満 → メイン業種のみでOK（付帯サービス扱い）\n\n📘 よくある例\n・ホテル ＋ レストラン（外来客の売上比率で判断）\n・製造業 ＋ 小売・EC（自社通販の売上比率）\n・飲食 ＋ ケータリング（外販・出張料理の比率）\n・小売 ＋ EC（ネット通販の売上比率）\n・IT ＋ コンサル（助言業務の売上比率）\n・建設 ＋ 設計（設計単独受注の比率）\n\n※ 売上比率が不明な場合は「スタッフ工数」や「取引先数」で代替判断してください。", "category": "core", "required": true, "options": [] },
    { "id": "company_name", "type": "text", "text": "貴社名（診断書に記載されます）", "category": "core", "required": true, "placeholder": "例: 株式会社〇〇" },
    { "id": "agent_name", "type": "text", "text": "担当者名 / 代理店名（診断書に記載されます）", "category": "core", "required": false, "placeholder": "例: 山田 太郎 / 〇〇保険事務所" },
    { "id": "employee_count", "type": "number", "text": "従業員数（パート・アルバイト含む）は何名ですか？", "category": "core", "required": true, "unit": "名", "min": 1, "max": 99999, "triggers_branch": ["harassment_measures"] },
    { "id": "annual_revenue", "type": "number", "text": "直近1年間の年間売上高（または売上見込み）はおよそいくらですか？", "category": "core", "required": true, "unit": "万円", "min": 0, "max": 9999999, "placeholder": "例: 5000（5,000万円）/ 10000（1億円）", "triggers_branch": ["branch_has_shareholders"] },
    { "id": "has_factory", "type": "boolean", "text": "製造・加工を行う拠点（自社・賃借問わず）がありますか？", "hint": "「店舗とは別の工場・加工場」の有無を聞いています。\n✅ 工場／セントラルキッチン／独立した工房 → はい\n❌ 飲食店の店舗内厨房／小売／オフィスのみ → いいえ", "category": "core", "required": true, "triggers_branch": ["branch_factory_area", "branch_factory_structure", "branch_fire_suppression", "branch_key_supplier_dependency", "branch_night_work"] },
    { "id": "has_store", "type": "boolean", "text": "店舗・営業所（自社所有・賃借問わず）はありますか？", "category": "core", "required": true, "triggers_branch": ["branch_store_count", "branch_factory_area", "branch_factory_structure", "branch_fire_suppression", "branch_has_delivery", "branch_night_work"] },
    {
      "id": "business_form",
      "type": "select",
      "text": "主な事業所・店舗の建物について、あてはまるものを選んでください",
      "hint": "火災保険の補償設計に直結します。テナントにビルオーナー向けの補償を提案するのは代理店として最低限の確認事項です",
      "category": "core",
      "required": true,
      "condition": { "op": "or", "conditions": [ { "field": "has_factory", "op": "eq", "value": true }, { "field": "has_store", "op": "eq", "value": true } ] },
      "triggers_branch": ["branch_factory_area", "branch_factory_structure", "branch_fire_suppression"],
      "options": [
        { "value": "tenant", "label": "賃貸で入居している（借主・テナント）" },
        { "value": "owner_occupied", "label": "自社で所有し、自社のみで使用している" },
        { "value": "landlord", "label": "自社で所有し、一部または全部を他社・他者に貸している" },
        { "value": "mixed", "label": "賃貸で入居している物件と、自社所有の物件の両方がある" }
      ]
    },
    { "id": "export_ratio", "type": "select", "text": "売上に占める輸出・海外取引・越境ECの割合は？", "category": "core", "required": true, "options": [{ "value": "0", "label": "なし（国内のみ）" }, { "value": "0.1", "label": "10%未満" }, { "value": "0.3", "label": "10〜30%程度" }, { "value": "0.6", "label": "30〜60%程度" }, { "value": "0.9", "label": "60%以上" }], "triggers_branch_on": { "neq": "0" }, "triggers_branch": ["branch_export_country", "branch_export_amount", "branch_overseas_trip"] },
    { "id": "has_vehicles", "type": "boolean", "text": "業務用車両（社用車・運搬車など）を保有していますか？", "category": "core", "required": true, "triggers_branch": ["branch_vehicle_count", "branch_vehicle_type", "branch_uses_employee_vehicles"] },
    { "id": "handles_products", "type": "boolean", "text": "自社で製品・食品・商品の製造や販売をしていますか？", "hint": "「お客様にモノ（料理・商品）を提供しているか」を聞いています。\n✅ 飲食店の料理提供／小売・EC／製造・卸売 → はい\n❌ コンサル／IT受託／士業／清掃などサービスのみ → いいえ", "category": "core", "required": true, "triggers_branch": ["branch_product_recall_exp", "inventory_value"] },
    { "id": "has_construction_work", "type": "boolean", "text": "建設・土木・設備工事など、工事作業（自社施工・外注問わず）が発生しますか？", "category": "core", "required": true, "triggers_branch": ["branch_construction_scale", "branch_sub_contract_ratio", "construction_position"] },
    { "id": "has_it_systems", "type": "boolean", "text": "顧客データ・予約システム・POSレジ・業務システムなど、ITやクラウドを業務に利用していますか？", "category": "core", "required": true, "triggers_branch": ["branch_data_sensitivity", "remote_work_ratio"] },
    { "id": "handles_cash_valuables", "type": "boolean", "text": "現金・貴重品・高価な在庫品の取り扱いはありますか？", "category": "core", "required": true, "triggers_branch": ["branch_cash_amount"] },
    { "id": "has_employees_work_accident_risk", "type": "select", "text": "従業員が業務中にケガをするリスクはどのくらいありますか？", "category": "core", "required": true, "options": [{ "value": "low", "label": "低い（デスクワーク中心・来客対応のみ）" }, { "value": "medium", "label": "中程度（現場・配達・接客・立ち作業あり）" }, { "value": "high", "label": "高い（重機・高所・危険物・農作業など）" }] },
    { "id": "third_party_risk", "type": "select", "text": "仕事上のミスや事故で、お客様・取引先に損害を与えてしまうリスクは？", "category": "core", "required": true, "options": [{ "value": "low", "label": "低い（相手への影響が少ない業務内容）" }, { "value": "medium", "label": "中程度（ミスがあれば損害が生じる可能性あり）" }, { "value": "high", "label": "高い（工事・医療・システム開発など、ミスで大きな損害が生じうる）" }] },
    {
      "id": "provides_expert_service",
      "type": "select",
      "text": "顧客に対して、専門知識・技術・アドバイスを有償で提供していますか？",
      "hint": "IT開発・コンサル・設計・会計・医療・法律・不動産鑑定などが該当します。業種が「IT業」でも「受託開発」か「自社プロダクト販売」かで賠償リスクが全然違います",
      "category": "core",
      "required": true,
      "condition": { "field": "industry", "op": "in", "value": ["it", "service", "medical", "real_estate", "finance", "construction"] },
      "options": [
        { "value": "yes_core", "label": "はい、それが事業の中心です（IT・コンサル・医療・設計・法律など）" },
        { "value": "yes_partial", "label": "一部あります（商品販売に加えて専門アドバイスも行う）" },
        { "value": "no", "label": "いいえ（商品・サービスの提供のみ）" }
      ]
    },
    { "id": "business_interruption_sensitivity", "type": "select", "text": "火災・水害などで1ヶ月間営業できなくなった場合、経営への影響は？", "category": "core", "required": true, "options": [{ "value": "low", "label": "軽微（在宅・他拠点でなんとか継続できる）" }, { "value": "medium", "label": "中程度（売上は大幅に落ちるが、しばらくは持ちこたえられる）" }, { "value": "high", "label": "深刻（固定費・借入返済が続き、倒産リスクが生じる）" }], "triggers_branch": ["branch_fixed_cost_level"] },
    { "id": "company_age_years", "type": "number", "text": "会社（または個人事業）の創業・設立は何年ですか？（西暦）", "category": "core", "required": true, "unit": "年（西暦）", "min": 1900, "max": new Date().getFullYear(), "placeholder": "例: 2010" },
    { "id": "branch_factory_area", "type": "number", "text": "主な拠点（工場・店舗・事務所等）の延床面積はおよそ何㎡ですか？", "hint": "テナントの場合は、ご自身が使用されている「専有面積」を入力してください", "category": "branch", "unit": "㎡", "min": 0 },
    { "id": "branch_factory_structure", "type": "select", "text": "その拠点の建物構造を教えてください", "hint": "テナントの場合、ビル全体の構造（RC造、鉄骨造など）が不明であれば「わからない」を選択してください", "category": "branch", "options": [{ "value": "steel", "label": "鉄骨造" }, { "value": "rc", "label": "RC（鉄筋コンクリート）造" }, { "value": "wood", "label": "木造" }, { "value": "unknown", "label": "わからない" }] },
    { "id": "branch_fire_suppression", "type": "boolean", "text": "その拠点にスプリンクラーや自動消火設備はありますか？", "category": "branch" },
    { "id": "branch_store_count", "type": "number", "text": "店舗・営業所の数は何拠点ですか？", "category": "branch", "unit": "拠点", "min": 1 },
    {
      "id": "inventory_value",
      "type": "select",
      "text": "店舗・工場・倉庫等に常時保管している在庫・商品・原材料の総額は？",
      "hint": "製造業の場合は、原材料・仕掛品・製品の合計額でお答えください",
      "category": "branch",
      "options": [
        { "value": "low", "label": "100万円未満" },
        { "value": "medium", "label": "100万〜500万円" },
        { "value": "high", "label": "500万〜1,000万円" },
        { "value": "very_high", "label": "1,000万円以上" }
      ]
    },
    { "id": "branch_export_country", "type": "multi_select", "text": "主な輸出先・海外取引国・地域を選んでください", "category": "branch", "options": [{ "value": "US", "label": "米国" }, { "value": "CN", "label": "中国" }, { "value": "EU", "label": "EU" }, { "value": "ASEAN", "label": "東南アジア" }, { "value": "OTHER", "label": "その他" }] },
    { "id": "branch_export_amount", "type": "number", "text": "年間の輸出・海外売上高はおよそいくらですか？", "category": "branch", "unit": "万円", "min": 0 },
    { "id": "branch_vehicle_count", "type": "number", "text": "業務用車両は何台ですか？", "category": "branch", "unit": "台", "min": 1 },
    { "id": "branch_vehicle_type", "type": "multi_select", "text": "業務用車両の種類を選んでください", "category": "branch", "options": [{ "value": "passenger", "label": "乗用車" }, { "value": "truck", "label": "トラック・貨物車" }, { "value": "special", "label": "特殊車両（フォークリフト等）" }] },
    { "id": "branch_product_recall_exp", "type": "boolean", "text": "過去に製品・食品のクレーム、リコール、食中毒等の対応経験はありますか？", "category": "branch" },
    { "id": "branch_construction_scale", "type": "select", "text": "工事1件あたりの規模はどのくらいですか？", "category": "branch", "options": [{ "value": "small", "label": "小規模（〜1,000万円）" }, { "value": "medium", "label": "中規模（1,000万〜1億円）" }, { "value": "large", "label": "大規模（1億円以上）" }] },
    {
      "id": "construction_position",
      "type": "select",
      "text": "建設・工事業における貴社の立場は主にどちらですか？",
      "hint": "元請は発注者への直接賠償責任を持ちます。下請は元請から求償されます。保険の設計が根本的に変わります",
      "category": "branch",
      "options": [
        { "value": "prime", "label": "元請が多い（発注者から直接受注）" },
        { "value": "sub", "label": "下請け・孫請けが多い" },
        { "value": "both", "label": "両方（元請・下請どちらも行う）" }
      ]
    },
    { "id": "branch_sub_contract_ratio", "type": "select", "text": "下請け・外注の比率はどのくらいですか？", "category": "branch", "options": [{ "value": "low", "label": "少ない（30%未満）" }, { "value": "medium", "label": "中程度（30〜70%）" }, { "value": "high", "label": "多い（70%以上）" }] },
    { "id": "branch_data_sensitivity", "type": "select", "text": "どのくらいの個人情報・機密情報を扱っていますか？", "category": "branch", "options": [{ "value": "low", "label": "低い（社内データのみ、顧客情報なし）" }, { "value": "medium", "label": "中程度（氏名・住所・連絡先など顧客の基本情報）" }, { "value": "high", "label": "高い（クレカ・医療・マイナンバー・口座情報など）" }] },
    {
      "id": "remote_work_ratio",
      "type": "select",
      "text": "従業員のテレワーク・在宅勤務の割合はどのくらいですか？",
      "hint": "在宅比率が高い会社はVPN・個人PC経由の情報漏洩リスクが格段に上がります。保険料と補償の説得根拠として使えます",
      "category": "branch",
      "options": [
        { "value": "none", "label": "ほぼなし（週1日未満）" },
        { "value": "partial", "label": "一部（〜30%、週1〜2日程度）" },
        { "value": "high", "label": "半数以上（週3日以上）" }
      ]
    },
    { "id": "branch_cash_amount", "type": "select", "text": "1日の最大現金保管額はどのくらいですか？（売上金・預かり金・商品等を含む）", "category": "branch", "options": [{ "value": "low", "label": "50万円未満" }, { "value": "medium", "label": "50万〜500万円" }, { "value": "high", "label": "500万円以上" }] },
    { "id": "branch_agri_crop_type", "type": "select", "text": "主な農業・水産業の形態を教えてください", "category": "core", "condition": { "field": "industry", "op": "eq", "value": "agriculture" }, "options": [{"value":"field","label":"露地栽培（野菜・果樹・穀物）"},{"value":"greenhouse","label":"施設栽培（ハウス・温室）"},{"value":"livestock","label":"畜産・酪農"},{"value":"fishery","label":"水産・養殖"},{"value":"mixed","label":"複合経営"}] },
    { "id": "branch_agri_facility_value", "type": "number", "text": "農業用施設・機械を今すぐ買い直す場合の概算金額（再調達価額）はいくらですか？", "category": "core", "condition": { "field": "industry", "op": "eq", "value": "agriculture" }, "unit": "万円", "min": 0 },
    { "id": "branch_uses_employee_vehicles", "type": "boolean", "text": "社員が自分の車（私用車）を業務に使うことがありますか？（営業・配達・通勤利用など）", "category": "branch" },
    { "id": "branch_has_delivery", "type": "boolean", "text": "商品・食品の配達・デリバリー（宅配・EC出荷・給食提供など）を行っていますか？", "category": "branch" },
    { "id": "branch_fixed_cost_level", "type": "select", "text": "毎月の固定費合計（家賃・人件費・借入返済など）はどのくらいですか？", "category": "core", "condition": { "op": "or", "conditions": [ { "field": "business_interruption_sensitivity", "op": "eq", "value": "high" }, { "field": "annual_revenue", "op": "gte", "value": 5000 } ] }, "options": [{"value":"low","label":"100万円未満"},{"value":"medium","label":"100万〜500万円"},{"value":"high","label":"500万〜2,000万円"},{"value":"very_high","label":"2,000万円以上"}] },
    { "id": "branch_has_shareholders", "type": "boolean", "text": "創業家族・役員以外の外部株主（投資家・VC・親会社など）はいますか？", "category": "core", "condition": { "field": "annual_revenue", "op": "gte", "value": 10000 } },
    {
      "id": "harassment_measures",
      "type": "select",
      "text": "ハラスメント防止規程の整備や、従業員からの相談窓口を設けていますか？",
      "hint": "従業員数が多い会社ほど未対応だとリスクが高く、「実は知らなかった」顧客が最も多い領域です",
      "category": "core",
      "condition": { "field": "employee_count", "op": "gte", "value": 10 },
      "options": [
        { "value": "done", "label": "整備済み（規程・相談窓口あり）" },
        { "value": "partial", "label": "一部対応（規程はあるが窓口なし、など）" },
        { "value": "none", "label": "未対応・わからない" }
      ]
    },
    { "id": "branch_night_work", "type": "boolean", "text": "深夜・早朝（22時〜翌5時）に作業や営業を行うことがありますか？", "category": "branch" },
    { "id": "branch_key_supplier_dependency", "type": "boolean", "text": "売上や仕入れの50%以上が特定の1〜2社の取引先・仕入先に集中していますか？", "category": "branch" },
    { "id": "branch_overseas_trip", "type": "boolean", "text": "従業員が海外出張・海外派遣をすることがありますか？", "category": "branch" },
    {
      "id": "current_fire_known",
      "type": "select",
      "text": "現在、火災保険（店舗・工場・事業所向け）に加入していますか？",
      "category": "current_contract",
      "policy_unknown_flag": true,
      "related_category": "fire",
      "condition": { "op": "or", "conditions": [ { "field": "has_factory", "op": "eq", "value": true }, { "field": "has_store", "op": "eq", "value": true }, { "field": "industry", "op": "in", "value": ["food", "manufacturing", "real_estate", "construction", "retail", "transport", "medical", "service", "agriculture"] } ] },
      "options": [
        { "value": true, "label": "加入しており、内容も把握している" },
        { "value": "partial", "label": "加入しているが、内容は不明" },
        { "value": false, "label": "加入していない / わからない" }
      ]
    },
    {
      "id": "current_food_known",
      "type": "select",
      "text": "現在、食中毒や製品事故を補償する保険（PL保険）に加入していますか？",
      "category": "current_contract",
      "policy_unknown_flag": true,
      "related_category": "food_poisoning",
      "condition": { "op": "or", "conditions": [ { "field": "industry", "op": "in", "value": ["food", "retail", "manufacturing", "agriculture", "medical"] }, { "field": "handles_products", "op": "eq", "value": true } ] },
      "options": [
        { "value": true, "label": "加入しており、内容も把握している" },
        { "value": "partial", "label": "加入しているが、内容は不明" },
        { "value": false, "label": "加入していない / わからない" }
      ]
    },
    {
      "id": "current_liability_known",
      "type": "select",
      "text": "現在、賠償責任保険（他者への損害を補償する保険）に加入していますか？",
      "category": "current_contract",
      "policy_unknown_flag": true,
      "related_category": "liability",
      "condition": { "op": "or", "conditions": [ { "field": "third_party_risk", "op": "in", "value": ["medium", "high"] }, { "field": "industry", "op": "in", "value": ["construction", "medical", "it", "finance", "manufacturing", "transport", "food", "retail", "real_estate", "service", "agriculture"] }, { "field": "handles_products", "op": "eq", "value": true }, { "field": "has_construction_work", "op": "eq", "value": true }, { "field": "harassment_measures", "op": "eq", "value": "none" } ] },
      "options": [
        { "value": true, "label": "加入しており、内容も把握している" },
        { "value": "partial", "label": "加入しているが、内容は不明" },
        { "value": false, "label": "加入していない / わからない" }
      ]
    },
    {
      "id": "current_accident_known",
      "type": "select",
      "text": "現在、従業員のケガを補償する保険（労災上乗せ保険）に加入していますか？",
      "category": "current_contract",
      "policy_unknown_flag": true,
      "related_category": "accident",
      "condition": { "field": "employee_count", "op": "gt", "value": 0 },
      "options": [
        { "value": true, "label": "加入しており、内容も把握している" },
        { "value": "partial", "label": "加入しているが、内容は不明" },
        { "value": false, "label": "加入していない / わからない" }
      ]
    },
    {
      "id": "current_vehicle_known",
      "type": "select",
      "text": "現在、業務用車両の自動車保険に加入していますか？",
      "category": "current_contract",
      "policy_unknown_flag": true,
      "related_category": "vehicle",
      "condition": { "op": "or", "conditions": [ { "field": "has_vehicles", "op": "eq", "value": true }, { "field": "branch_uses_employee_vehicles", "op": "eq", "value": true } ] },
      "options": [
        { "value": true, "label": "加入しており、内容も把握している" },
        { "value": "partial", "label": "加入しているが、内容は不明" },
        { "value": false, "label": "加入していない / わからない" }
      ]
    },
    {
      "id": "current_cargo_known",
      "type": "select",
      "text": "現在、輸送中の荷物や商品の損害を補償する保険（貨物保険）に加入していますか？",
      "category": "current_contract",
      "policy_unknown_flag": true,
      "related_category": "cargo",
      "condition": { "op": "or", "conditions": [ { "field": "export_ratio", "op": "neq", "value": "0" }, { "field": "industry", "op": "in", "value": ["transport", "manufacturing", "retail", "food", "agriculture"] }, { "field": "branch_has_delivery", "op": "eq", "value": true } ] },
      "options": [
        { "value": true, "label": "加入しており、内容も把握している" },
        { "value": "partial", "label": "加入しているが、内容は不明" },
        { "value": false, "label": "加入していない / わからない" }
      ]
    },
    {
      "id": "current_cyber_known",
      "type": "select",
      "text": "現在、サイバー攻撃や情報漏洩を補償する保険（サイバー保険）に加入していますか？",
      "category": "current_contract",
      "policy_unknown_flag": true,
      "related_category": "cyber",
      "condition": { "op": "or", "conditions": [ { "field": "has_it_systems", "op": "eq", "value": true }, { "field": "branch_data_sensitivity", "op": "in", "value": ["medium", "high"] }, { "field": "industry", "op": "in", "value": ["it", "medical", "retail", "finance", "food", "manufacturing", "real_estate", "service", "transport"] } ] },
      "options": [
        { "value": true, "label": "加入しており、内容も把握している" },
        { "value": "partial", "label": "加入しているが、内容は不明" },
        { "value": false, "label": "加入していない / わからない" }
      ]
    },
    {
      "id": "current_dno_known",
      "type": "select",
      "text": "現在、役員個人の賠償責任を補償する保険（D&O保険）に加入していますか？",
      "category": "current_contract",
      "policy_unknown_flag": true,
      "related_category": "directors",
      "condition": { "op": "or", "conditions": [ { "field": "branch_has_shareholders", "op": "eq", "value": true }, { "field": "annual_revenue", "op": "gte", "value": 10000 }, { "field": "employee_count", "op": "gte", "value": 50 } ] },
      "options": [
        { "value": true, "label": "加入しており、内容も把握している" },
        { "value": "partial", "label": "加入しているが、内容は不明" },
        { "value": false, "label": "加入していない / わからない" }
      ]
    },
    {
      "id": "current_interruption_known",
      "type": "select",
      "text": "現在、災害や事故による休業損失を補償する保険（利益保険）に加入していますか？",
      "category": "current_contract",
      "policy_unknown_flag": true,
      "related_category": "interruption",
      "condition": { "op": "or", "conditions": [ { "field": "business_interruption_sensitivity", "op": "in", "value": ["medium", "high"] }, { "field": "branch_fixed_cost_level", "op": "in", "value": ["high", "very_high"] }, { "field": "has_factory", "op": "eq", "value": true }, { "field": "industry", "op": "in", "value": ["manufacturing", "food", "agriculture", "medical", "retail", "transport", "it"] } ] },
      "options": [
        { "value": true, "label": "加入しており、内容も把握している" },
        { "value": "partial", "label": "加入しているが、内容は不明" },
        { "value": false, "label": "加入していない / わからない" }
      ]
    }
  ]
};
