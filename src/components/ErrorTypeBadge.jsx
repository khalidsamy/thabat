import { getErrorTypeMeta } from '../utils/errorTypes';

const ErrorTypeBadge = ({ value, lang }) => {
  const meta = getErrorTypeMeta(value);

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${meta.color}`}>
      {lang === 'ar' ? meta.labelAr : meta.label}
    </span>
  );
};

export default ErrorTypeBadge;
