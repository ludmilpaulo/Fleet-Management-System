export type TableRow = {
  id: string;
  [key: string]: any; // Dynamic key-value pairs for each column
};
export type TableColumn = {
  id: string;
  label: string;
  type?: string;
  align?: string;
  sortable?: boolean;
  onDelete?: (params: TableRow) => void;
  onEdit?: (params: TableRow) => void;
  renderCell?: (
    params: TableRow,
    selectedRows?: TableRow[],
    clearSelectedRows?: () => void,
  ) => React.ReactElement;
  valueGetter?: (params: TableRow) => string;
  valueFormatter?: (params: TableRow) => string;
  getActions?: (params: TableRow) => React.ReactElement<any>[];
};

export type TableProps = {
  columns: TableColumn[];
  rows: TableRow[];
  title?: string;
  className?: string;
  theadClassName?: string;
  tbodyClassName?: string;
  footer?: React.ReactNode;
  action?: React.ReactNode;
  loading?: boolean;
  rowCount?: number;
  canSelect?: boolean;
  bgSwitchColor?: string;
  bgSwitchEnableColor?: string;
  deselect?: boolean;
  minHeight?: number;
  paginationEnabled?: boolean;
  rowsPerPage?: number;
  itemTotal?: number;
  page?: number;
  selectedRowsData?: TableRow[];
  showEmptyTableErrorMsg?: boolean;
  EmptyTableErrorMsg?: string;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  paginationOptions?: number[];
  changePage?: (value?: any) => void;
  changeRowsPerPage?: (value?: any) => void;
  onEdit?: (params: TableRow) => void;
  getSelectedRows?: (params: TableRow[]) => void;
  setSelectedRows?: (params: TableRow[]) => void;
  onClick?: (data: TableRow) => void;
  getOnClickColumn?: (data: string, row: TableRow) => void;
  //   onPaginationChange?: ({ page, pageSize }: PageProps) => void;
};
