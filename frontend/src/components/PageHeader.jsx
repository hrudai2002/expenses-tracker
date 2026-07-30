function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action ? <div className="page-header-action">{action}</div> : null}
    </div>
  );
}

export default PageHeader;

