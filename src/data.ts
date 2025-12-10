
export interface CategoryOption {
  readonly value: string;
  readonly label: string;
  readonly color: string;
  readonly isFixed?: boolean;
  readonly isDisabled?: boolean;
}
export interface StatusOption {
  readonly value: string;
  readonly label: string;
  readonly color: string;
  readonly isFixed?: boolean;
  readonly isDisabled?: boolean;
}

export const categoryOptions : readonly CategoryOption [] = [
  { value: 'Scaffold', label: 'Scaffold' , color: "#EFD652", },
  { value: 'Sidewalk Shed', label: 'Sidewalk Shed', color: "#67AA3C", },
  { value: 'Shoring', label: 'Shoring', color: "#9640BE",},
];


export const statusOptions : readonly StatusOption [] = [
  { value: 'On Hold', label: 'On Hold' , color: "#EFD652", },
  { value: 'In progress', label: 'In progress', color: "#B3D99B", },
  { value: 'Completed', label: 'Completed', color: "#7AC14D",},
];

