/**
 * Shared page header component for management list pages.
 * Renders a title, subtitle, and optional action buttons (right side).
 * Matches the `page-head` / `page-title` / `page-sub` pattern from ui-redesign-mockup.html.
 */

import React from 'react';

interface ManagementPageHeaderProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const ManagementPageHeader = ({
  icon,
  title,
  subtitle,
  actions,
}: ManagementPageHeaderProps) => (
  <div className="mgmt-page-header">
    <div>
      <h4 className="mgmt-page-title">
        {icon && (
          <i
            className={`${icon} me-2`}
            style={{ color: 'var(--mp-dark, #005092)', fontSize: '1.1rem' }}
          />
        )}
        {title}
      </h4>
      {subtitle && <p className="mgmt-page-subtitle">{subtitle}</p>}
    </div>
    {actions && <div className="mgmt-page-actions">{actions}</div>}
  </div>
);

export default ManagementPageHeader;
