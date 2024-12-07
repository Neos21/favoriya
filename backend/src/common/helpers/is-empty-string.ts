/** 引数が undefined・null・空白を除去して空文字なら `true` */
export const isEmptyString = (value: string): boolean => {
  if(value == null) return true;
  if(value === '') return true;
  if(String(value).trim() === '') return true;
  return false;
};
