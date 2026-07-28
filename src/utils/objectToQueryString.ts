const objectToQueryString = (
  obj: Record<string, string | number | undefined>,
) => {
  const searchParams = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, value.toString());
    }
  });

  return searchParams.toString();
};

export default objectToQueryString;
