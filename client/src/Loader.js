const Loader = ({ size = 24, className = "" }) => {
  return (
    <svg
      className={"loader " + className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#375a7f"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
};

export default Loader;
