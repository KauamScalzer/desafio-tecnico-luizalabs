describe('main.ts', () => {
  it('should import main.ts without throwing', () => {
    expect(() => require('./main')).not.toThrow();
  });
});
