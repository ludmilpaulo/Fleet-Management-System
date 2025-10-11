import React from "react";

type DashboardCardProps = {
  icon: React.ElementType;
  title: string;
  value: string | number;
  description?: string;
  iconClass?: string;
};
const DashboardCard = ({
  title,
  icon,
  value,
  description,
  iconClass,
}: DashboardCardProps) => {
  return (
    <div className="flex flex-col gap-2 rounded-md border p-4 w-[100%]">
      <span className="flex justify-between gap-2">
        <h6>{title}</h6>
        {React.createElement(icon, { className: iconClass })}
      </span>
      <p>{value}</p>
      <p>{description}</p>
    </div>
  );
};

export default DashboardCard;
