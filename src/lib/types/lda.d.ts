declare module "lda" {
  const lda: (
    documents: string[],
    topics: number,
    termsPerTopic: number
  ) => Array<Array<string>>;
  export default lda;
}
