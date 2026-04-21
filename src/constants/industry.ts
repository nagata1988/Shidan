export const INDUSTRY_TREE = [
  {
    value: "manufacturing", label: "製造業", icon: "🏭",
    sub: [
      { value: "manufacturing_food", label: "食品・飲料製造" },
      { value: "manufacturing_chemical", label: "化学・医薬品製造" },
      { value: "manufacturing_metal", label: "金属・鉄鋼製造" },
      { value: "manufacturing_machinery", label: "機械・装置製造" },
      { value: "manufacturing_electric", label: "電気・電子部品製造" },
      { value: "manufacturing_auto", label: "自動車・輸送機器製造" },
      { value: "manufacturing_textile", label: "繊維・アパレル製造" },
      { value: "manufacturing_wood", label: "木材・家具製造" },
      { value: "manufacturing_plastic", label: "ゴム・プラスチック製造" },
      { value: "manufacturing_printing", label: "印刷・出版" },
      { value: "manufacturing_other", label: "その他製造業" },
    ]
  },
  {
    value: "construction", label: "建設・工事業", icon: "🏗️",
    sub: [
      { value: "construction_general", label: "総合建設（ゼネコン）" },
      { value: "construction_civil", label: "土木・造成工事" },
      { value: "construction_electric_work", label: "電気工事" },
      { value: "construction_plumbing", label: "管工事・空調設備" },
      { value: "construction_interior", label: "内装・リフォーム工事" },
      { value: "construction_painting", label: "塗装工事" },
      { value: "construction_plant", label: "プラント・設備工事" },
      { value: "construction_other", label: "その他建設業" },
    ]
  },
  {
    value: "retail", label: "小売・卸売業", icon: "🛒",
    sub: [
      { value: "retail_grocery", label: "食品スーパー・食料品店" },
      { value: "retail_apparel", label: "衣料品・ファッション" },
      { value: "retail_electronics", label: "家電・IT機器販売" },
      { value: "retail_auto_parts", label: "自動車・部品販売" },
      { value: "retail_drugstore", label: "ドラッグストア・化粧品" },
      { value: "retail_furniture", label: "家具・ホームセンター" },
      { value: "retail_wholesale_food", label: "食品卸売" },
      { value: "retail_wholesale_industrial", label: "工業用品・資材卸売" },
      { value: "retail_ec", label: "EC・通信販売" },
      { value: "retail_other", label: "その他小売・卸売" },
    ]
  },
  {
    value: "food", label: "飲食・宿泊業", icon: "🍽️",
    sub: [
      { value: "food_restaurant", label: "レストラン・食堂" },
      { value: "food_izakaya", label: "居酒屋・バー" },
      { value: "food_fastfood", label: "ファストフード・テイクアウト" },
      { value: "food_cafe", label: "カフェ・喫茶店" },
      { value: "food_catering", label: "給食・ケータリング" },
      { value: "food_hotel_banquet", label: "ホテル・旅館・宴会場" },
      { value: "food_other", label: "その他飲食業" },
    ]
  },
  {
    value: "transport", label: "運輸・物流業", icon: "🚚",
    sub: [
      { value: "transport_freight", label: "一般貨物輸送（トラック）" },
      { value: "transport_warehouse", label: "倉庫・物流センター" },
      { value: "transport_taxi_bus", label: "タクシー・バス・旅客輸送" },
      { value: "transport_sea", label: "海運・港湾" },
      { value: "transport_air", label: "航空・空港関連" },
      { value: "transport_courier", label: "宅配・メッセンジャー" },
      { value: "transport_moving", label: "引越し・運送" },
      { value: "transport_other", label: "その他運輸業" },
    ]
  },
  {
    value: "it", label: "IT・情報通信業", icon: "💻",
    sub: [
      { value: "it_software_dev", label: "ソフトウェア開発・SIer" },
      { value: "it_saas", label: "SaaS・クラウドサービス" },
      { value: "it_web", label: "Webサービス・プラットフォーム" },
      { value: "it_consulting", label: "ITコンサルティング" },
      { value: "it_security", label: "情報セキュリティ" },
      { value: "it_network", label: "通信・ネットワーク" },
      { value: "it_data", label: "データセンター・クラウド基盤" },
      { value: "it_game", label: "ゲーム・エンタメコンテンツ" },
      { value: "it_other", label: "その他IT・通信業" },
    ]
  },
  {
    value: "medical", label: "医療・介護・福祉", icon: "🏥",
    sub: [
      { value: "medical_hospital", label: "病院・クリニック" },
      { value: "medical_dental", label: "歯科医院" },
      { value: "medical_pharmacy", label: "調剤薬局" },
      { value: "medical_nursing_home", label: "介護施設・特養" },
      { value: "medical_home_care", label: "訪問介護・在宅医療" },
      { value: "medical_welfare", label: "福祉・障がい者支援" },
      { value: "medical_childcare", label: "保育所・こども園" },
      { value: "medical_other", label: "その他医療・福祉" },
    ]
  },
  {
    value: "real_estate", label: "不動産業", icon: "🏢",
    sub: [
      { value: "real_estate_brokerage", label: "不動産仲介・売買" },
      { value: "real_estate_management", label: "不動産管理・賃貸管理" },
      { value: "real_estate_development", label: "不動産開発・ディベロッパー" },
      { value: "real_estate_leasing", label: "賃貸住宅・オフィスビル経営" },
      { value: "real_estate_other", label: "その他不動産業" },
    ]
  },
  {
    value: "finance", label: "金融・保険業", icon: "🏦",
    sub: [
      { value: "finance_bank", label: "銀行・信用金庫" },
      { value: "finance_insurance_agency", label: "保険代理店" },
      { value: "finance_securities", label: "証券・投資" },
      { value: "finance_leasing", label: "リース・クレジット" },
      { value: "finance_other", label: "その他金融業" },
    ]
  },
  {
    value: "service", label: "サービス業", icon: "🤝",
    sub: [
      { value: "service_cleaning", label: "清掃・メンテナンス" },
      { value: "service_security", label: "警備・セキュリティ" },
      { value: "service_hr", label: "人材派遣・紹介" },
      { value: "service_consulting", label: "経営・財務コンサルティング" },
      { value: "service_accounting", label: "税理士・会計事務所" },
      { value: "service_legal", label: "弁護士・司法書士事務所" },
      { value: "service_advertising", label: "広告・PR・デザイン" },
      { value: "service_travel", label: "旅行・観光業" },
      { value: "service_entertainment", label: "娯楽・スポーツ・フィットネス" },
      { value: "service_education", label: "学習塾・教育サービス" },
      { value: "service_beauty", label: "美容院・理容・エステ" },
      { value: "service_other", label: "その他サービス業" },
    ]
  },
  {
    value: "agriculture", label: "農業・林業・漁業", icon: "🌾",
    sub: [
      { value: "agriculture_farming", label: "農業（耕種・畜産）" },
      { value: "agriculture_forestry", label: "林業・木材業" },
      { value: "agriculture_fishery", label: "漁業・水産業" },
      { value: "agriculture_other", label: "その他農林水産業" },
    ]
  },
  {
    value: "other", label: "その他", icon: "📋",
    sub: [
      { value: "other_npo", label: "NPO・社会福祉法人" },
      { value: "other_public", label: "官公庁・公的機関" },
      { value: "other_misc", label: "上記に当てはまらない" },
    ]
  },
];

export const INDUSTRY_PARENT_MAP: Record<string, string> = {};
INDUSTRY_TREE.forEach(major => {
  major.sub.forEach(sub => { INDUSTRY_PARENT_MAP[sub.value] = major.value; });
});

export function getIndustryParent(val: string) {
  return INDUSTRY_PARENT_MAP[val] || val;
}

export function getIndustryLabel(val: string) {
  for (const major of INDUSTRY_TREE) {
    if (major.value === val) return { major: major.label, sub: null, icon: major.icon };
    const sub = major.sub.find(s => s.value === val);
    if (sub) return { major: major.label, sub: sub.label, icon: major.icon };
  }
  return { major: val, sub: null, icon: "📋" };
}
