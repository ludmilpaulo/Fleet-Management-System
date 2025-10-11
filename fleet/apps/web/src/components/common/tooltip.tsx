import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// props
type Props = {
  trigger: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
};

const TooltipComponent = ({ trigger, content, side }: Props) => {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side={side || "top"}>{content}</TooltipContent>
    </Tooltip>
  );
};

export default TooltipComponent;
