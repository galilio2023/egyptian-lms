import { MockUnit } from "@/lib/db/mock-data";

export type UnitCardVariant = "catalog" | "student" | "admin";

export interface UnitCardBaseProps {
  unit: MockUnit;
  className?: string;
}

export interface CatalogUnitCardProps extends UnitCardBaseProps {
  variant: "catalog";
  onEnroll?: (unit: MockUnit) => void;
  ctaText?: string;
}

export interface StudentUnitCardProps extends UnitCardBaseProps {
  variant: "student";
  isUnlocked: boolean;
  onSelectLockedUnit?: (unit: MockUnit) => void;
}

export interface AdminUnitCardProps extends UnitCardBaseProps {
  variant: "admin";
  onOpenUpload?: (unit: MockUnit) => void;
  onDeleteUnit?: (unit: MockUnit) => void;
}

export type UnitCardProps =
  | CatalogUnitCardProps
  | StudentUnitCardProps
  | AdminUnitCardProps;
