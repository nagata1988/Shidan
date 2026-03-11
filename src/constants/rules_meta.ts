export const CUSTOMER_COMMENT: Record<string, (ans: any) => string> = {

  fire: (ans) => {
    const inds = ans.industries || [];
    const parts: string[] = [];

    // ① リスク根拠 + ② 損害イメージ（業種×建物形態で分岐）
    if (inds.includes('food')) {
      if (ans.business_form === 'tenant') {
        parts.push('飲食業は厨房・火気設備を常時使用するため、消防庁統計で出火リスクが全業種最高水準にあります。テナント入居の場合、火災による什器・設備・在庫への損害に加え、建物オーナーへの損害賠償責任（借家人賠償）が同時に発生するリスクがあります。');
      } else if (ans.business_form === 'owner_occupied') {
        parts.push('飲食業は全業種で最も出火リスクが高く、厨房火災が発生した場合は建物本体・設備・在庫の全てが損害対象になります。自社所有の場合、建物の再調達価額（今すぐ建て直す場合の金額）と現在の保険金額が一致しているかが重要です。');
      } else if (ans.business_form === 'landlord') {
        parts.push('飲食業の出火リスクは全業種最高水準です。建物オーナーの場合、自社の火災リスクに加え、入居テナントが引き起こした火災への対応・入居者への賠償責任も発生します。建物本体の補償・家主賠償・施設賠償を組み合わせた設計が必要です。');
      } else {
        parts.push('飲食業の出火リスクは全業種最高水準です。賃貸と自社所有が混在している場合、借家人賠償（賃借部分）・建物補償（所有部分）・家主賠償（貸出部分）が同時に必要となり、補償設計が最も複雑なケースです。');
      }
    } else if (inds.includes('manufacturing') && ans.has_factory) {
      parts.push('製造業は可燃物・熱源・化学物質の取り扱いにより、火災リスクが高い業種です。製造設備が被災した場合、修復・再稼働まで数ヶ月を要するケースがあり、その間の固定費負担・取引先への納品遅延損害が同時に発生します。');
    } else if (ans.business_form === 'landlord') {
      parts.push('建物を賃貸している場合、建物本体の火災損害に加え、入居テナントへの賠償責任や、テナントが引き起こした火災への対応が必要になります。建物の再調達価額ベースでの保険金額設定と、家主賠償・施設賠償の付帯が重要です。');
    } else if (inds.includes('agriculture')) {
      parts.push('農業用ハウス・乾燥設備・農機具倉庫は木造・可燃性素材が多く、火災リスクが高い施設です。農業用施設は一般の火災保険では評価が難しい場合があり、専用設計の確認が必要です。');
    } else {
      parts.push('事業所・店舗・設備の火災・自然災害リスクが確認されます。建物・設備・在庫の再調達価額（買い直しにかかる金額）と現在の補償額の乖離がないか確認が必要です。');
    }

    // ④ 個別要因
    if (ans.branch_factory_structure === 'wood') {
      parts.push('木造建築は鉄骨・RC造と比べて延焼が速く、全焼リスクが高い傾向があります。保険料率も高くなるため、補償額と保険料のバランスを確認することをお勧めします。');
    }
    if (ans.branch_fire_suppression === false) {
      parts.push('スプリンクラー等の自動消火設備がない場合、延焼リスクが残ります。消火設備の設置により保険料割引が適用できる場合があります。');
    }
    if (ans.inventory_value === 'very_high') {
      parts.push('在庫・商品の総額が1,000万円以上と回答されています。火災・盗難による在庫全損は事業継続に直接影響するため、動産の補償額設定根拠を確認することをお勧めします。');
    }

    // ③ 現在の補償状況
    const fireKnown = ans.current_fire_known;
    if (fireKnown === false || fireKnown === 'false') {
      parts.push('現在の火災保険の加入状況が未確認です。補償ギャップが生じている可能性があります。');
    } else if (fireKnown === 'partial') {
      parts.push('火災保険に加入されていますが、補償内容の詳細が未確認です。補償金額の過不足がないか確認をお勧めします。');
    } else {
      parts.push('火災保険の内容は把握済みです。補償金額が再調達価額に対して不足していないか（一部保険の問題）を確認してください。');
    }

    // ⑤ 次の1アクション
    if (ans.business_form === 'tenant') {
      parts.push('【次の確認】テナント入居の場合、借家人賠償責任保険の加入有無と補償限度額をまず確認してください。');
    } else if (ans.business_form === 'landlord' || ans.business_form === 'mixed') {
      parts.push('【次の確認】所有建物の再調達価額と現在の保険金額の差額を確認してください。');
    } else {
      parts.push('【次の確認】建物・設備の再調達価額（現時点での建替え・買替え費用）を確認してください。');
    }

    return parts.join(' ');
  },

  food_poisoning: (ans) => {
    const inds = ans.industries || [];
    const parts: string[] = [];

    if (inds.includes('food')) {
      parts.push('飲食業は食中毒・異物混入リスクが他業種と比較にならない頻度で発生します。食中毒が発生した場合、保健所による営業停止命令が出ることがあり、停止期間中も家賃・人件費・借入返済は継続します。');
      if ((ans.branch_store_count || 0) >= 2) {
        parts.push(`${ans.branch_store_count}店舗を運営されています。1店舗での食中毒発生が他店舗の営業停止命令に連鎖するリスクがあります。全店舗をカバーする補償設計になっているか確認が必要です。`);
      }
    } else if (inds.includes('manufacturing')) {
      parts.push('食品製造業では、製品の欠陥・汚染による大規模リコールが発生した場合、回収費用・原因調査費用・賠償責任が同時に発生します。リコール費用特約の付帯状況を確認することをお勧めします。');
    } else if (inds.includes('retail')) {
      parts.push('食品を販売する小売業では、仕入れた商品に起因する食中毒が発生した場合でも、販売者として賠償責任を問われるケースがあります。');
    } else if (inds.includes('agriculture')) {
      parts.push('農産物の食中毒リスクは飲食業・食品製造業と比べて低い傾向がありますが、農薬残留・菌汚染による出荷後の損害賠償リスクは存在します。');
    } else {
      parts.push('食品・製品の製造・販売に関連する生産物賠償リスクが確認されます。');
    }

    if (ans.branch_product_recall_exp === true) {
      parts.push('過去にクレーム・リコール対応のご経験があります。再発リスクは統計上、未経験の企業より高い傾向があります。現在の補償限度額が過去の賠償実績を上回っているか確認することをお勧めします。');
    }
    if (ans.branch_has_delivery === true && inds.includes('food')) {
      parts.push('デリバリー・配送を行っている場合、食中毒の発生から発覚まで時間差が生じやすく、被害が拡大してから判明するリスクがあります。');
    }

    if (ans.current_liability_known === false || ans.current_liability_known === 'false') {
      parts.push('現在の賠償責任保険に食中毒特約が付帯されているか未確認です。特約がない場合、食中毒は補償対象外になります。');
    } else if (ans.current_liability_known === 'partial') {
      parts.push('賠償責任保険に加入されていますが、食中毒特約の付帯状況が未確認です。証券で確認することをお勧めします。');
    } else {
      parts.push('賠償責任保険の内容は把握済みです。食中毒特約の補償限度額と営業停止補償の有無を確認してください。');
    }

    if (ans.branch_product_recall_exp === true) {
      parts.push('【次の確認】現在の補償限度額が過去のクレーム・賠償実績に対して十分かを確認してください。');
    } else if (inds.includes('food')) {
      parts.push('【次の確認】現在の賠償責任保険に食中毒特約と営業停止補償が付帯されているかを確認してください。');
    } else {
      parts.push('【次の確認】PL保険（生産物賠償責任保険）の加入有無と補償限度額を確認してください。');
    }

    return parts.join(' ');
  },

  liability: (ans) => {
    const inds = ans.industries || [];
    const parts: string[] = [];

    if (inds.includes('construction') && ans.has_construction_work) {
      if (ans.construction_position === 'prime' || ans.construction_position === 'both') {
        parts.push('元請立場での工事は、発注者への直接賠償責任が発生します。下請け立場とは保険設計が根本的に異なり、工事中の対人・対物事故に加え、完成後の瑕疵担保責任も長期にわたってリスクが続きます。');
      } else {
        parts.push('建設・工事作業では、作業中の対人・対物事故リスクが常時存在します。現場での事故は高額賠償に発展するケースがあります。');
      }
      if (ans.branch_sub_contract_ratio === 'high') {
        parts.push('下請け比率が70%を超えています。再委託先の事故が元請けの賠償責任に直結するリスクがあり、協力会社の保険加入状況も確認が必要です。');
      }
    } else if (inds.includes('medical')) {
      parts.push('医療・施術業務では、医療過誤・施術ミスによる高額賠償リスクがあります。一般的な施設賠償責任保険では専門的な医療行為による損害が補償対象外になる場合があります。');
    } else if (inds.includes('it') || ans.provides_expert_service === 'yes_core') {
      parts.push('ITシステム開発・運用や専門的サービスの失敗による顧客への経済的損害は、一般的な施設賠償責任保険では補償対象外になるケースがあります。E&O保険（専門職賠償責任保険）と一般の賠償責任保険は補償範囲が異なります。');
    } else {
      parts.push('業務上の事故やミスによる第三者への賠償リスクが確認されます。補償限度額が業務規模・リスクの実態に対して適切かどうかの確認が重要です。');
    }

    if (ans.harassment_measures === 'none') {
      parts.push('ハラスメント防止規程・相談窓口が未整備の場合、使用者賠償責任を問われるリスクがあります。弁護士費用等の対応コストをカバーする特約の付帯状況を確認することをお勧めします。');
    }
    if (ans.branch_product_recall_exp === true) {
      parts.push('過去にクレーム対応のご経験があります。現在の補償限度額が過去の賠償実績を上回っているか確認をお勧めします。');
    }

    if (ans.current_liability_known === false || ans.current_liability_known === 'false') {
      parts.push('現在の賠償責任保険の加入・内容が未確認です。補償限度額と補償対象業務の範囲を確認することをお勧めします。');
    } else if (ans.current_liability_known === 'partial') {
      parts.push('賠償責任保険に加入されていますが、内容が未確認です。補償限度額が現在の業務規模に対応しているか確認をお勧めします。');
    } else {
      parts.push('賠償責任保険の内容は把握済みです。補償限度額が適切か、業種特有のリスクをカバーする特約が付帯されているか確認してください。');
    }

    if (inds.includes('it') || ans.provides_expert_service === 'yes_core') {
      parts.push('【次の確認】E&O保険（専門職賠償）の加入有無を確認してください。一般の賠償責任保険では補償されない損害があります。');
    } else if (ans.construction_position === 'prime') {
      parts.push('【次の確認】請負業者賠償責任保険の補償限度額が最大工事規模に対応しているか確認してください。');
    } else {
      parts.push('【次の確認】現在の賠償責任保険の補償限度額（いくらまでカバーされるか）を証券で確認してください。');
    }

    return parts.join(' ');
  },

  accident: (ans) => {
    const inds = ans.industries || [];
    const parts: string[] = [];

    if (inds.includes('construction')) {
      parts.push('建設業の労働災害死亡者数は全産業で最多となっています（厚生労働省令和5年：223人）。高所・重機・倒壊の複合リスクが常時存在し、重大事故につながりやすい環境です。政府労災だけでは遺族への生活保障として不十分なケースがあり、上乗せ補償の設計が重要です。');
    } else if (inds.includes('agriculture')) {
      parts.push('農業の労災度数率は全産業中最高水準です（厚生労働省）。農機事故・熱中症・農薬中毒の複合リスクは、一般的な傷害保険の想定を超えることがあります。農業者専用の傷害保険（農機事故・熱中症特約付き）への切り替えを検討する価値があります。');
    } else if (inds.includes('transport')) {
      parts.push('運送業の死傷年千人率は全産業平均と比べて高い傾向があります（厚生労働省）。長距離運転・積み下ろし作業での事故は腰痛・骨折等の重傷につながるケースがあります。');
    } else if (inds.includes('manufacturing')) {
      parts.push('製造現場では機械巻き込み・プレス・化学物質による重大事故リスクがあります。後遺障害・死亡事故が発生した場合、政府労災の給付額では補償が不十分なケースがあります。');
    } else if (inds.includes('food')) {
      parts.push('厨房業務では熱傷・切傷・転倒事故が多発します。発生頻度は高くないものの、重傷事故の発生リスクが存在します。');
    } else {
      parts.push('業務中の従業員のケガ・事故リスクが確認されます。法定労災の給付額では実際の補償に不足が生じるケースがあります。');
    }

    if (ans.branch_night_work === true) {
      parts.push('深夜・早朝作業（22時〜翌5時）がある場合、疲労・視認性低下による事故リスクが高まります。夜間作業に対応した補償設定になっているか確認をお勧めします。');
    }
    if (ans.branch_overseas_trip === true) {
      parts.push('海外出張・派遣中の事故・疾病は、国内の政府労災が適用されないケースがあります。海外旅行傷害保険（業務中の事故・疾病・救援費用）が別途必要です。');
    }
    if ((ans.employee_count || 0) >= 50) {
      parts.push(`従業員が${ans.employee_count}名いる場合、団体傷害保険のグループ割引（保険料15〜30%割引）が適用できる可能性があります。`);
    }

    if (ans.current_accident_known === false || ans.current_accident_known === 'false') {
      parts.push('従業員向け傷害保険の加入状況が未確認です。法定労災の上乗せ補償の有無を確認することをお勧めします。');
    } else if (ans.current_accident_known === 'partial') {
      parts.push('傷害保険に加入されていますが内容が未確認です。休業補償日額・後遺障害限度額が現在の給与水準に合っているか確認をお勧めします。');
    } else {
      parts.push('傷害保険の内容は把握済みです。補償日額・後遺障害限度額の設定が現在の給与水準・業務リスクに対応しているか確認してください。');
    }

    if (ans.branch_overseas_trip === true) {
      parts.push('【次の確認】海外出張・派遣時の保険が業務中の事故・疾病をカバーしているか確認してください。');
    } else if (inds.includes('construction') || inds.includes('agriculture')) {
      parts.push('【次の確認】政府労災の上乗せ補償（後遺障害・死亡時の補償額）が現在の給与水準に対して十分かを確認してください。');
    } else {
      parts.push('【次の確認】法定労災に上乗せする傷害保険の有無と、休業補償の日額設定を確認してください。');
    }

    return parts.join(' ');
  },

  vehicle: (ans) => {
    const parts: string[] = [];
    const vc = ans.branch_vehicle_count || 0;
    const inds = ans.industries || [];
    const types = ans.branch_vehicle_type || [];

    if (inds.includes('transport')) {
      parts.push('運輸・物流業は車両事故リスクが事業の根幹に関わります。大型車両の事故は対人賠償が高額化するリスクがあります。');
    } else {
      parts.push(`業務用車両を${vc}台保有されています。交通事故発生時の対人・対物賠償リスクが存在します。`);
    }

    if (ans.branch_uses_employee_vehicles === true) {
      parts.push('社員が自分の車（私用車）を業務に利用している場合、社員個人の任意保険が業務使用をカバーしていないケースがあります。事故発生時に会社が賠償責任を負う可能性があるため、確認が必要です。');
    }
    if (types.includes('special')) {
      parts.push('フォークリフト等の特殊車両は、自賠責保険の対象外になる場合や、構内・敷地内での事故に一般の自動車保険が適用されないケースがあります。');
    }
    if (vc >= 20) {
      parts.push(`${vc}台の保有はフリート保険の対象です。ノンフリート契約より保険コストの最適化が図れる可能性があります。`);
    } else if (vc >= 5) {
      parts.push(`${vc}台の保有はフリート管理が有効な規模です。一括管理による保険設計の見直しを検討する価値があります。`);
    }

    if (ans.current_vehicle_known === false || ans.current_vehicle_known === 'false') {
      parts.push('業務用車両の任意保険の内容が未確認です。対人・対物の補償限度額（無制限か有額か）は最優先で確認が必要です。');
    } else if (ans.current_vehicle_known === 'partial') {
      parts.push('自動車保険に加入されていますが内容が未確認です。対人・対物の補償が無制限設定になっているか確認をお勧めします。');
    } else {
      parts.push('自動車保険の内容は把握済みです。対人・対物の無制限設定と搭乗者補償の内容を確認してください。');
    }

    if (ans.branch_uses_employee_vehicles === true) {
      parts.push('【次の確認】業務利用している社員全員の任意保険が「業務使用」をカバーしているか確認してください。');
    } else if (types.includes('special')) {
      parts.push('【次の確認】特殊車両（フォークリフト等）の構内使用時の補償が確保されているか確認してください。');
    } else {
      parts.push('【次の確認】対人・対物賠償が無制限設定になっているか証券で確認してください。');
    }

    return parts.join(' ');
  },

  cargo: (ans) => {
    const inds = ans.industries || [];
    const parts: string[] = [];

    if (inds.includes('transport')) {
      parts.push('運輸業は受託貨物の損傷・紛失が直接的な賠償責任となります。貨物賠償責任保険のカバー範囲と補償限度額を確認することをお勧めします。');
    } else if (inds.includes('manufacturing')) {
      parts.push('製造業は完成品輸送での貨物リスクが高い傾向があります。出荷額が大きいほど財務インパクトが高くなるため、輸送中貨物保険のカバー状況を確認してください。');
    } else if (inds.includes('food')) {
      parts.push('食材・飲料の温度管理事故・配送中損害のリスクがあります。冷蔵・冷凍貨物の温度管理特約の付帯状況を確認することをお勧めします。');
    } else {
      parts.push('輸送中の貨物損害リスクが確認されます。現在の保険が輸送中の破損・紛失・温度管理事故をカバーしているか確認してください。');
    }

    if (ans.export_ratio && ans.export_ratio !== '0') {
      parts.push('海外取引がある場合、インコタームズ（貿易条件）によって保険を負担すべき当事者が変わります。貿易条件と保険の整合性を確認することをお勧めします。');
    }
    if ((ans.branch_export_country || []).includes('US')) {
      parts.push('米国向け輸出は、製品不具合による訴訟リスクが他国と比較にならないほど高い傾向があります。補償設計の確認をお勧めします。');
    }

    parts.push('【次の確認】輸送中の貨物損害に対する補償の有無と、補償が適用される輸送区間を確認してください。');
    return parts.join(' ');
  },

  cyber: (ans) => {
    const inds = ans.industries || [];
    const parts: string[] = [];
    const sens = ans.branch_data_sensitivity;

    if (inds.includes('it')) {
      parts.push('IT企業は標的型攻撃・サプライチェーン攻撃のリスクが高く、自社への攻撃が顧客システムへの侵入口になる可能性があります。サイバーインシデントによる顧客への経済的損害は、一般的な賠償責任保険では補償されません。');
    } else if (inds.includes('medical')) {
      parts.push('医療機関の電子カルテ・医療機器はサイバー攻撃の標的になりやすい情報を保有しています。ランサムウェアによる電子カルテ暗号化は診療停止に直結し、患者対応・データ復旧に多大なコストが発生します。');
    } else if (inds.includes('manufacturing')) {
      parts.push('製造業のサイバー被害件数は全業種の中で高い割合を占めています（IPA情報セキュリティ統計）。製造制御システム（OT/ICS）へのサイバー攻撃は生産ライン全停止につながる可能性があります。');
    } else {
      parts.push('ITシステム・クラウドを業務利用している企業は、情報漏洩・サイバー攻撃のリスクが存在します。サイバーインシデント発生時の対応費用（専門家費用・顧客通知費用・システム復旧費用）は補償がない場合は全額自己負担となります。');
    }

    if (sens === 'high') {
      parts.push('クレジットカード・医療情報・マイナンバー等の高感度情報を扱っている場合、情報漏洩時の損害賠償と個人情報保護委員会への報告義務が同時に発生します。漏洩件数が多い場合、通知費用だけで多大なコストになるケースがあります。');
    } else if (sens === 'medium') {
      parts.push('顧客の個人情報（氏名・住所・連絡先等）を保有している場合、情報漏洩時の通知費用・損害賠償リスクがあります。個人情報保護法の改正により、報告義務の範囲が拡大しています。');
    }
    if (ans.remote_work_ratio === 'high') {
      parts.push('テレワーク比率が高い場合、VPN・個人PCを経由した情報漏洩リスクが高まります。サイバー保険の補償範囲がテレワーク中の事故をカバーしているか確認をお勧めします。');
    }

    if (ans.current_cyber_known === false || ans.current_cyber_known === 'false') {
      parts.push('サイバー保険の加入状況が未確認です。インシデント発生時の対応費用・賠償責任・利益損失の補償状況を確認することをお勧めします。');
    } else if (ans.current_cyber_known === 'partial') {
      parts.push('サイバー保険に加入されていますが内容が未確認です。①対応費用 ②賠償責任 ③利益損失の3つの補償が揃っているか確認をお勧めします。');
    } else {
      parts.push('サイバー保険の内容は把握済みです。補償限度額と補償の3本柱（対応費用・賠償責任・利益損失）が揃っているか確認してください。');
    }

    if (sens === 'high') {
      parts.push('【次の確認】高感度情報の漏洩を想定した補償限度額（最低5,000万円以上が目安）が確保されているか確認してください。');
    } else if (inds.includes('manufacturing')) {
      parts.push('【次の確認】製造制御システム（OT/ICS）がサイバー保険の補償対象に含まれているか確認してください。');
    } else {
      parts.push('【次の確認】サイバーインシデント発生時の対応費用（専門家費用・顧客通知費用）が補償されているか確認してください。');
    }

    return parts.join(' ');
  },

  directors: (ans) => {
    const inds = ans.industries || [];
    const parts: string[] = [];
    const rev = ans.annual_revenue || 0;

    if (ans.branch_has_shareholders === true) {
      parts.push('外部株主（投資家・VC・親会社等）がいる場合、株主代表訴訟リスクが高まります。株主代表訴訟では、役員個人が会社に対して損害賠償を求められるため、役員個人の財産に影響が及ぶリスクがあります。');
    } else if (inds.includes('finance')) {
      parts.push('金融業では、金融規制違反・説明責任違反による金融庁処分・訴訟リスクがあります。役員個人への法的追及リスクが他業種と比べて高い傾向があります。');
    } else if (inds.includes('medical')) {
      parts.push('医療機関の経営判断は、行政処分・患者訴訟・職員からの使用者賠償と多方向のリスクを持ちます。役員の意思決定が個人の法的責任に直結するケースがあります。');
    } else {
      parts.push('企業の役員は、経営判断に関して株主・取引先・従業員から法的責任を追及されるリスクがあります。役員賠償責任保険（D&O保険）は、この種の訴訟費用・損害賠償を補償します。');
    }

    if (ans.harassment_measures === 'none' && (ans.employee_count || 0) >= 50) {
      parts.push('ハラスメント対策が未整備で従業員が50名以上いる場合、役員の安全配慮義務違反として代表訴訟・労働審判の対象になるリスクがあります。D&O保険に雇用慣行賠償（EPL）特約が付帯されているか確認をお勧めします。');
    }
    if (rev >= 100000) {
      parts.push(`年商が${(rev/10000).toFixed(0)}億円規模の場合、補償限度額3億円以上の設定が実務上の目安とされています。`);
    } else if (rev >= 10000) {
      parts.push('年商1億円以上の場合、補償限度額1億円以上が実務上の最低基準とされています。');
    }

    parts.push('役員賠償責任保険（D&O保険）の加入状況と補償限度額を確認することをお勧めします。');

    if (ans.branch_has_shareholders === true) {
      parts.push('【次の確認】D&O保険の補償限度額が外部株主からの株主代表訴訟を想定した金額になっているか確認してください。');
    } else {
      parts.push('【次の確認】D&O保険の加入有無と、補償限度額が現在の年商・従業員規模に対応しているか確認してください。');
    }

    return parts.join(' ');
  },

  interruption: (ans) => {
    const inds = ans.industries || [];
    const parts: string[] = [];
    const fixedCost = ans.branch_fixed_cost_level;

    if (inds.includes('food')) {
      parts.push('飲食業は、火災による被災だけでなく、食中毒による行政命令での強制営業停止が発生するリスクがあります。強制停止期間中も家賃・人件費・借入返済は継続するため、固定費の補償が重要です。');
    } else if (inds.includes('manufacturing') && ans.has_factory) {
      parts.push('製造設備が被災した場合、修復・再稼働まで数ヶ月を要するケースがあります。その間も固定費は発生し続け、取引先への納品遅延による損害賠償リスクも同時に生じます。');
    } else if (inds.includes('agriculture')) {
      parts.push('農業は台風・冷害・病害虫による収穫皆無リスクがあります。農業収入保険（農林水産省制度）は天候リスク・価格下落も含めた包括的な補償が可能です。');
    } else {
      parts.push('施設被災や外部要因による営業停止が発生した場合、固定費（家賃・人件費・借入返済）が継続します。利益保険（BI保険）は、この停止期間中の固定費・逸失利益を補償します。');
    }

    if (fixedCost === 'very_high') {
      parts.push('月次固定費が2,000万円超の場合、1ヶ月の営業停止で2,000万円以上の損失が確定します。利益保険の補償期間（通常12ヶ月）と補償額の設定が財務的に重要です。');
    } else if (fixedCost === 'high') {
      parts.push('月次固定費が500万〜2,000万円の場合、数ヶ月の営業停止で資金繰りへの影響が生じます。利益保険による固定費補償の設計を確認することをお勧めします。');
    }
    if (ans.branch_key_supplier_dependency === true) {
      parts.push('売上の50%以上が特定の取引先・仕入先に集中している場合、その取引先が被災・停止した際に自社の売上もゼロになるリスクがあります（サプライチェーン断絶リスク）。利益保険がこのケースをカバーしているか確認が必要です。');
    }

    if (ans.current_fire_known === false || ans.current_fire_known === 'false') {
      parts.push('火災保険の加入状況が未確認です。利益保険（BI保険）は通常、火災保険に付帯する形で設計されます。');
    } else if (ans.current_fire_known === 'partial') {
      parts.push('火災保険に加入されていますが内容が未確認です。利益保険が付帯されているか、補償期間は何ヶ月かを確認することをお勧めします。');
    } else {
      parts.push('火災保険の内容は把握済みです。利益保険の付帯有無・補償期間・補償額が固定費水準に対応しているか確認してください。');
    }

    if (fixedCost === 'very_high' || ans.business_interruption_sensitivity === 'high') {
      parts.push('【次の確認】月次固定費の総額と、利益保険の補償期間（何ヶ月分か）を照合してください。');
    } else if (ans.branch_key_supplier_dependency === true) {
      parts.push('【次の確認】現在の利益保険が取引先被災による売上減少（サプライチェーン断絶）をカバーしているか確認してください。');
    } else {
      parts.push('【次の確認】現在の火災保険に利益保険が付帯されているか確認してください。');
    }

    return parts.join(' ');
  },
};

export const AGENT_MEMO: Record<string, (ans: any) => string> = {
  fire: (ans) => {
    const memos: string[] = [];
    if (ans.current_fire_known === false || ans.current_fire_known === 'false') {
      memos.push('🔴 未加入・未確認：新規提案の機会。まず証券持参依頼から入る。');
    }
    if (ans.business_form === 'landlord' || ans.business_form === 'mixed') {
      memos.push('📌 建物オーナー・混在：建物の再調達価額の確認が最優先。家主賠償・施設賠償もセット提案。');
    }
    if (ans.inventory_value === 'very_high') {
      memos.push('📌 在庫1,000万円超：動産保険の補償額設定根拠を確認。過小評価されているケースが多い。');
    }
    if (ans.branch_factory_structure === 'wood') {
      memos.push('⚠️ 木造：保険料率が高い。RC・鉄骨への改修コストとの費用対効果も含めた提案が差別化になる。');
    }
    return memos.join('\n') || '標準的な火災保険の見直し提案。補償額の過不足確認から入る。';
  },
  food_poisoning: (ans) => {
    const memos: string[] = [];
    const inds = ans.industries || [];
    if (ans.current_liability_known === false || ans.current_liability_known === 'false') {
      memos.push('🔴 未加入・未確認：食中毒特約の新規提案。飲食業では最も成約率が高い提案の一つ。');
    }
    if (ans.branch_product_recall_exp === true) {
      memos.push('🔴 過去クレームあり：再発リスク高。補償限度額を1段階引き上げた設計で提案する。');
    }
    if (inds.includes('food') && (ans.branch_store_count || 0) >= 3) {
      memos.push('📌 多店舗展開：全店舗一括補償かどうか確認。店舗ごとの個別設計より一括が有利なケースが多い。');
    }
    return memos.join('\n') || '食中毒特約の付帯状況確認から入る。';
  },
  liability: (ans) => {
    const memos: string[] = [];
    const inds = ans.industries || [];
    if (ans.provides_expert_service === 'yes_core' && (inds.includes('it') || inds.includes('service'))) {
      memos.push('🔴 E&O最優先：IT・専門職はE&O保険が未加入のケース多い。「通常の賠償保険では補償されない」を訴求。');
    }
    if (ans.construction_position === 'prime' && ans.branch_construction_scale === 'large') {
      memos.push('🔴 元請×大規模：請負業者賠償の限度額確認最優先。1億円超工事は補償額の引き上げ提案。');
    }
    if (ans.harassment_measures === 'none') {
      memos.push('📌 ハラスメント未整備：使用者賠償＋弁護士費用特約（2024年新設）をセット提案。整備支援もセールスポイント。');
    }
    return memos.join('\n') || '賠償責任保険の補償限度額と対象業務の確認から入る。';
  },
  accident: (ans) => {
    const memos: string[] = [];
    const inds = ans.industries || [];
    if (ans.current_accident_known === false || ans.current_accident_known === 'false') {
      memos.push('🔴 未加入・未確認：政府労災上乗せの新規提案。建設・製造業では特に成約率高。');
    }
    if (inds.includes('construction') || inds.includes('agriculture')) {
      memos.push('📌 高リスク業種：後遺障害・死亡補償額の設定が勝負。給与水準に合わせた設計を提案。');
    }
    if (ans.branch_overseas_trip === true) {
      memos.push('📌 海外出張あり：海外旅行傷害保険の未加入を確認。漏れやすい保険の一つ。');
    }
    return memos.join('\n') || '法定労災の上乗せ補償の有無確認から入る。';
  },
  vehicle: (ans) => {
    const memos: string[] = [];
    const vc = ans.branch_vehicle_count || 0;
    if (ans.branch_uses_employee_vehicles === true) {
      memos.push('🔴 私用車業務利用：社員の任意保険の業務使用確認が最優先。会社の賠償リスクを具体的に説明。');
    }
    if (vc >= 10) {
      memos.push(`📌 ${vc}台：フリート契約の見直し提案。ノンフリートとの保険料差額を試算して提示。`);
    }
    if ((ans.branch_vehicle_type || []).includes('special')) {
      memos.push('📌 特殊車両あり：構内専用保険の付帯確認。自賠責対象外の説明が有効。');
    }
    return memos.join('\n') || '対人・対物の無制限設定確認から入る。';
  },
  cargo: (ans) => {
    const memos: string[] = [];
    if (ans.export_ratio && ans.export_ratio !== '0') {
      memos.push('📌 輸出あり：インコタームズ条件と保険の整合性確認。FOB条件なら輸出者側の保険が必要。');
    }
    if ((ans.branch_export_country || []).includes('US')) {
      memos.push('🔴 米国輸出：PL訴訟リスクが高い。補償限度額の引き上げと海外PL特約を提案。');
    }
    return memos.join('\n') || '貨物保険の有無と補償範囲の確認から入る。';
  },
  cyber: (ans) => {
    const memos: string[] = [];
    if (ans.current_cyber_known === false || ans.current_cyber_known === 'false') {
      memos.push('🔴 未加入・未確認：サイバー保険の新規提案機会。3本柱（対応費用・賠償・利益損失）で説明。');
    }
    if (ans.branch_data_sensitivity === 'high') {
      memos.push('🔴 高感度情報：補償限度額5,000万円以上を提案。漏洩件数×通知費用の概算を試算して提示。');
    }
    if (ans.remote_work_ratio === 'high') {
      memos.push('📌 テレワーク高比率：テレワーク特有リスクの説明が有効。セキュリティ対策との連動提案も効果的。');
    }
    return memos.join('\n') || 'サイバー保険の補償3本柱の確認から入る。';
  },
  directors: (ans) => {
    const memos: string[] = [];
    if (ans.branch_has_shareholders === true) {
      memos.push('🔴 外部株主あり：D&O最優先提案。株主代表訴訟のメカニズムを具体例で説明すると刺さりやすい。');
    }
    if (ans.harassment_measures === 'none' && (ans.employee_count || 0) >= 50) {
      memos.push('📌 ハラスメント×大企業：EPL特約をD&Oに付帯する提案。liabilityとのセット提案が有効。');
    }
    return memos.join('\n') || 'D&O保険の加入有無・補償限度額の確認から入る。';
  },
  interruption: (ans) => {
    const memos: string[] = [];
    if (ans.business_interruption_sensitivity === 'high' && ans.branch_fixed_cost_level === 'very_high') {
      memos.push('🔴 最優先：停止深刻×固定費最高。「1ヶ月停止で2,000万円超の損失が確定」を数字で訴求。');
    }
    if (ans.branch_key_supplier_dependency === true) {
      memos.push('📌 取引先集中依存：サプライチェーン断絶リスクの説明が差別化になる。BI保険の補償範囲を確認。');
    }
    return memos.join('\n') || '火災保険へのBI付帯状況と補償期間の確認から入る。';
  },
};

export const NEXT_ACTION: Record<string, (ans: any) => string> = {
  fire: (ans) => {
    if (ans.business_form === 'tenant') return '借家人賠償責任保険の加入有無と補償限度額';
    if (ans.business_form === 'landlord' || ans.business_form === 'mixed') return '所有建物の再調達価額と現在の保険金額の差額';
    if (ans.current_fire_known === false || ans.current_fire_known === 'false') return '火災保険の証券の持参・内容確認';
    return '建物・設備の再調達価額（現時点での建替え・買替え費用）';
  },
  food_poisoning: (ans) => {
    if (ans.branch_product_recall_exp === true) return '現在の補償限度額と過去のクレーム・賠償実績の照合';
    const inds = ans.industries || [];
    if (inds.includes('food')) return '食中毒特約と営業停止補償の付帯状況';
    return 'PL保険の加入有無と補償限度額';
  },
  liability: (ans) => {
    const inds = ans.industries || [];
    if (inds.includes('it') || ans.provides_expert_service === 'yes_core') return 'E&O保険（専門職賠償）の加入有無';
    if (ans.construction_position === 'prime') return '請負業者賠償責任保険の補償限度額と工事規模の適合確認';
    return '賠償責任保険の補償限度額（いくらまでカバーされるか）';
  },
  accident: (ans) => {
    if (ans.branch_overseas_trip === true) return '海外出張時の保険が業務中の事故・疾病をカバーしているか';
    const inds = ans.industries || [];
    if (inds.includes('construction') || inds.includes('agriculture')) return '政府労災上乗せの後遺障害・死亡補償額と現在の給与水準の照合';
    return '法定労災の上乗せ傷害保険の有無と休業補償日額';
  },
  vehicle: (ans) => {
    if (ans.branch_uses_employee_vehicles === true) return '業務利用している社員全員の任意保険の業務使用特約の有無';
    if ((ans.branch_vehicle_type || []).includes('special')) return '特殊車両（フォークリフト等）の構内使用時の補償確認';
    return '対人・対物賠償が無制限設定になっているか';
  },
  cargo: (ans) => {
    if (ans.export_ratio && ans.export_ratio !== '0') return '輸出入貨物保険のカバー範囲とインコタームズ条件の確認';
    return '国内輸送中の貨物損害に対する補償の有無';
  },
  cyber: (ans) => {
    if (ans.branch_data_sensitivity === 'high') return '高感度情報の漏洩を想定した補償限度額（5,000万円以上が目安）';
    const inds = ans.industries || [];
    if (inds.includes('manufacturing')) return '製造制御システム（OT/ICS）がサイバー保険の補償対象に含まれているか';
    return 'サイバーインシデント発生時の対応費用補償の有無';
  },
  directors: (ans) => {
    if (ans.branch_has_shareholders === true) return 'D&O保険の補償限度額が外部株主からの訴訟を想定した金額か';
    return 'D&O保険の加入有無と補償限度額';
  },
  interruption: (ans) => {
    if (ans.branch_fixed_cost_level === 'very_high' || ans.business_interruption_sensitivity === 'high') return '月次固定費の総額と利益保険の補償期間（何ヶ月分か）の照合';
    if (ans.branch_key_supplier_dependency === true) return '利益保険が取引先被災による売上減少をカバーしているか';
    return '火災保険への利益保険（BI）の付帯有無と補償期間';
  },
};

export const INDUSTRY_CHECKLIST: Record<string, Record<string, string[]>> = {
  "fire": {
    "food": ["厨房内のダクト清掃頻度の確認", "大家さんへの賠償責任（借家人賠償）の限度額"],
    "manufacturing": ["機械設備の再調達価額の妥当性", "隣接建物への類焼リスク"],
    "real_estate": ["空室時の補償範囲", "施設賠償責任保険とのセット加入状況"],
    "all": ["建物の再調達価額の確認", "什器・備品・在庫の補償額の妥当性"]
  },
  "food_poisoning": {
    "food": ["テイクアウト・デリバリー商品の消費期限管理", "アレルギー情報の掲示・管理体制"],
    "manufacturing": ["原材料のトレーサビリティ管理", "製造ラインの洗浄・点検記録"],
    "all": ["衛生管理マニュアルの遵守状況", "従業員の検便・健康チェックの実施"]
  },
  "liability": {
    "construction": ["元請案件における発注者への賠償義務の範囲", "工事完了後の欠陥（完成物責任）の補償期間"],
    "it": ["システム障害による経済的損失の自己負担額設定", "委託先（再委託）の管理体制と賠償責任の所在"],
    "all": ["第三者への対人・対物賠償限度額の確認", "過去のクレーム事例の共有と再発防止策"]
  },
  "accident": {
    "construction": ["高所作業・重機使用時の安全管理マニュアルの有無", "一人親方・下請作業員の補償対象への含み方"],
    "manufacturing": ["機械の安全カバー設置や定期点検の実施状況", "化学物質・粉塵等の職業病リスクへの備え"],
    "all": ["安全衛生教育の実施状況", "ヒヤリハット事例の収集と対策"]
  },
  "vehicle": {
    "transport": ["アルコールチェックの実施記録と管理体制", "長時間運転・過労運転防止の労務管理"],
    "construction": ["特殊車両（フォークリフト等）の構内事故補償の有無", "積載物の落下による賠償リスク"],
    "all": ["運転免許証の有効期限・更新管理", "車両の日常点検・定期点検の実施"]
  },
  "cargo": {
    "manufacturing": ["完成品の梱包強度と輸送ルートの安全確認", "展示会への出品物など、一時的な保管・輸送の補償"],
    "agriculture": ["生鮮品の温度管理不備による腐備・劣化リスク", "自然災害による出荷不能時の補償"],
    "all": ["輸送業者の選定基準と賠償限度額の確認", "梱包・荷札の正確性と破損防止策"]
  },
  "cyber": {
    "it": ["受託開発におけるプログラムの不具合による損害賠償", "取引先へのウイルス感染拡大（サプライチェーン攻撃）のリスク"],
    "medical": ["電子カルテシステムの停止による診療不能リスク", "患者の機密性の高い個人情報の漏洩"],
    "all": ["OS・ソフトウェアの最新アップデート適用", "パスワード管理と多要素認証の導入状況"]
  },
  "directors": {
    "finance": ["法令遵守（コンプライアンス）違反による行政処分リスク", "顧客への説明義務違反による損害賠償"],
    "medical": ["医療法人の理事としての善管注意義務違反リスク", "不適切な労務管理による役員責任"],
    "all": ["取締役会議事録の作成・保管状況", "内部統制・コンプライアンス体制の整備"]
  },
  "interruption": {
    "food": ["食中毒発生時の強制営業停止による利益損失", "近隣火災による入店不能リスク"],
    "manufacturing": ["主要設備の故障・被災による納期遅延と違約金リスク", "代替生産拠点の確保にかかる費用"],
    "all": ["BCP（事業継続計画）の策定状況", "代替仕入先・外注先の確保状況"]
  }
};

// 後方互換エイリアス
export const PROPOSAL_TALK = CUSTOMER_COMMENT;
export const GAP_COMMENT = CUSTOMER_COMMENT;
export const RULES_META = {
  CUSTOMER_COMMENT,
  AGENT_MEMO,
  NEXT_ACTION,
  INDUSTRY_CHECKLIST
};
