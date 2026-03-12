import Appearance from "@/components/security";
import Sidebar from "@/components/dashboardSideBar";

const AppearancePage: React.FC = () => {
  return (
    <div className="app-theme-bg flex">
      <Sidebar activeItem="Security" />
      <Appearance />
    </div>
  );
};

export default AppearancePage;