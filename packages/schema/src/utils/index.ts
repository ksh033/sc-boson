export const getHistory = async () => {
    const umi: any = await import('@umijs/max');
    return umi.history
}
