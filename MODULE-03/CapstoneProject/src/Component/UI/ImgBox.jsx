
// Photo placeholder: a styled tile that stands in until real food
// photos are dropped in. Accepts `label` (accessibility + caption)
// and `style` (minHeight / width / borderRadius overrides).
function ImgBox({ label = 'dish photo', style }) {
  return (
    <div
      className="img-box"
      style={style}
      role="img"
      aria-label={label}
      title={label}
    >
      <span className="img-box-label">{label}</span>
    </div>
  );
}

export default ImgBox;
