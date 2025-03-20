import React from "react";
import * as FaIcons from "react-icons/fa";
import { IconType } from "react-icons";

type IconProps = {
  icon: keyof typeof FaIcons;
  className?: string;
};

const Icon: React.FC<IconProps> = ({ icon, className = "" }) => {
  // Get the icon component from FaIcons
  const IconComponent = FaIcons[icon] as IconType;

  return (
    <span className={className}>
      {/* Since React 19, we need to render icon components by calling them as function */}
      {IconComponent && IconComponent({})}
    </span>
  );
};

export default Icon;
