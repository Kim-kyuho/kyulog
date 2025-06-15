// src/app/page.tsx
import SliderProjectList from "@/components/SliderProjectList";

const dummyProjects = [
  {
    title: "Oracleによるデータマイグレーション",
    description: "エネルギー系企業のシステムデータをOracle DBでマイグレーションしたプロジェクトです。初期設計からSQL作成・検証まで全工程を担当しました。",
    image: "/blog-images/project1.jpg",
    link: "/projects/oracle-migration",
  },
  {
    title: "GISベースの地理情報システム開発",
    description: "ArcGISベースのガスおよび電気設備に関する地地理報システムを開発しました。顧客の要件を反映し、ユーザーフレンドリーなUI/UXを実現しました。",
    image: "/blog-images/project2.jpg",
    link: "/projects/gis-system-enhancement",
  },
  {
    title: "ポイント付与自動化システム開発",
    description: "特定条件に基づき顧客に自動でポイントを付与するバックエンドシステムを開発しました。効率的な精算と管理が可能なように設計されています。",
    image: "/blog-images/project3.jpg",
    link: "/projects/point-automation",
  },
  {
    title: "VIP顧客向けサービスシステム開発",
    description: "VIP顧客専用の申込手続きを簡素化するため、要件定義からシステム設計・開発までを担当しました。顧客の利便性を最優先に考慮しました。",
    image: "/blog-images/project4.jpg",
    link: "/projects/vip-signup-system",
  },
  {
    title: "エネルギー系システムの保守およびインシデント対応",
    description: "さまざまな小規模システムの障害対応、機能改善、定期点検を実施しています。現場とのコミュニケーションや緊急対応の経験が強みです。",
    image: "/blog-images/project5.jpg",
    link: "/projects/incident-maintenance",
  },
];

export default function ProjectsPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-6 text-center">My Projects</h1>
      <SliderProjectList projects={dummyProjects} />
    </section>
  );
}