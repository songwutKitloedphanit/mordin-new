import React, { useState } from 'react';
import Swal from 'sweetalert2';

import PrintQrCode from './PrintQrCode';

// import ConfirmAlert from '@/components/gui/ConfirmAlert';
import DataTableWrapper from '@/components/gui/DataTableWrapper';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import { LabelProps } from '@/components/printable/Label';

import { Laboratory, MachineTypeTypes } from '@/types/Laboratory';
import { AnalysisStandardInterface, UpdateAnalysisStandardResultDto } from '@/types/standard-sample/AnalysisStandards';
import { AnalysisStandardResult } from '@/types/standard-sample/AnalysisStandardResult';

interface StandardLabResultTableProps {
    data: AnalysisStandardInterface[];
    tableId: string;
    title: string;
    subtitle: string;
    loading: boolean;
    laboratoryData: Laboratory[];
    handleSubmitPreValue?: (resultValue: UpdateAnalysisStandardResultDto[]) => void;
}

const StandardLabResultTable: React.FC<StandardLabResultTableProps> = ({
    data,
    tableId,
    title,
    subtitle,
    laboratoryData,
    loading,
    handleSubmitPreValue,
}) => {
    // สำหรับ modal
    const [showModal, setShowModal] = useState(false);
    const [editingSampleCode, setEditingSampleCode] = useState<string | null>(
        null
    );
    const [editedResults, setEditedResults] = useState<
        {
            unitBefore: string | null;
            shortNameBefore: string | null;
            analysisStandardResultId: number;
            preValue: number | null;
        }[]
    >([]);
    const [originalResults, setOriginalResults] = useState<
        {
            unitBefore: string | null;
            shortNameBefore: string | null;
            analysisStandardResultId: number;
            preValue: number | null;
        }[]
    >([]);


    // ฟอร์แมตเลขทศนิยม
    const formatDecimal = (value: number): string => {
        return parseFloat(value.toFixed(3)).toString();
    };

    // เปิด modal แก้ไขข้อมูล preValue
    const openEditModal = (
        sampleCode: string,
        results: AnalysisStandardResult[],
        type: string
    ) => {
        setEditingSampleCode(sampleCode);


        const initValues = results.map(result => ({
            unitBefore: result.laboratorySetting?.laboratory.unitBefore ?? '',
            shortNameBefore: result.laboratorySetting?.laboratory.shortNameBefore ?? '',
            analysisStandardResultId: result.analysisStandardResultId,
            preValue: result.preValue ?? 0,
        }));


        setOriginalResults(initValues);
        setEditedResults(initValues);
        setShowModal(true);
    };

    // ปิด modal
    const closeModal = () => {
        setShowModal(false);
        setEditingSampleCode(null);
        setEditedResults([]);
    };

    // บันทึกข้อมูลจาก modal
    const saveModalChanges = () => {
        const changedResults: UpdateAnalysisStandardResultDto[] = editedResults
            .filter(edited => {
                const original = originalResults.find(
                    o => o.analysisStandardResultId === edited.analysisStandardResultId
                );
                return original && edited.preValue !== original.preValue;
            })
            .map(edited => ({
                analysisStandardResultId: edited.analysisStandardResultId,
                preValue: edited.preValue ?? 0,
                recordedType: 'input',
            }));

        if (changedResults.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'ไม่มีการเปลี่ยนแปลง',
                text: 'คุณยังไม่ได้แก้ไขข้อมูลใด ๆ',
            });
            closeModal();
            return;
        }

        if (handleSubmitPreValue) {
            handleSubmitPreValue(changedResults);
        }
        closeModal();
    };

    const [printQrCodeData, setPrintQrCodeData] = useState<LabelProps[] | null>(
        null
    );

    const handlePrint = (sampleCode: string, results: AnalysisStandardResult[]) => {
        const labels: LabelProps[] = [];

        // Assuming format SampleCode-Repeat-Lab
        // Standard Name as SampleCode

        results.forEach((res) => {
            const shortNameBefore =
                res?.laboratorySetting?.laboratory?.shortNameBefore ?? 'NoLab';

            const repeatCount = res.repeatNumber.toString().padStart(2, '0');
            // Encode logic: Name/Repeat-Lab? Or just Name-Repeat-Lab
            // Standards might contain slashes in name like "CRM/1".
            // Let's use clean name
            const cleanName = sampleCode.replace(/\//g, '-');

            const fileName = `${cleanName}-${repeatCount}-${shortNameBefore}`;

            labels.push({
                qrValue: fileName,
                qrText: fileName,
            });
        });

        setPrintQrCodeData(labels);
    };

    const columns = laboratoryData;

    const renderColumnHeaders = () => (
        <>
            <th>รหัสตัวอย่าง</th>
            <th>ประเภท</th>
            {columns?.map(column => (
                <React.Fragment key={column.laboratoryId}>
                    <th>{`${column.shortNameBefore} ${column.unitBefore === '' ? `` : `(${column.unitBefore})`}`}</th>
                    {column?.machineType?.type === MachineTypeTypes.RAW_VALUE ? null : (
                        <th>{`${column.shortNameAfter} (${column.unitAfter})`}</th>
                    )}
                </React.Fragment>
            ))}
            <th>MANAGEMENT</th>
        </>
    );

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <div className="card-head-row card-tools-still-right">
                                <h4 className="card-title">
                                    {title} <span>{subtitle}</span>
                                </h4>
                            </div>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center p-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <DataTableWrapper tableId={tableId} loading={loading}>
                                    <div className="table-responsive">
                                        <table
                                            id={tableId}
                                            className="table table-striped table-hover"
                                            style={{
                                                tableLayout: 'auto',
                                            }}
                                        >
                                            <thead>
                                                <tr className="text-center">{renderColumnHeaders()}</tr>
                                            </thead>
                                            <tfoot>
                                                <tr className="text-center">{renderColumnHeaders()}</tr>
                                            </tfoot>
                                            <tbody>
                                                {data.map((item, _index) => {
                                                    // Expand repeats if necessary OR group by item+repeat
                                                    // AnalysisStandardInterface has `analysisStandardResults[]` which contains ALL repeats.
                                                    // We need to group them by repeat number to show 1 row per physical sample.

                                                    const groupByRepeat = new Map<number, AnalysisStandardResult[]>();
                                                    item.analysisStandardResults.forEach(r => {
                                                        const rep = r.repeatNumber || 1;
                                                        if (!groupByRepeat.has(rep)) groupByRepeat.set(rep, []);
                                                        groupByRepeat.get(rep)?.push(r);
                                                    });

                                                    const rows: React.JSX.Element[] = [];

                                                    groupByRepeat.forEach((results, repeatNumber) => {
                                                        const sampleCode = `${item.name}${item.repeatCount > 1 ? `/${repeatNumber}` : ''}`;

                                                        rows.push(
                                                            <tr key={`${item.analysisStandardId}-${repeatNumber}`}>
                                                                <td className="text-left" style={{ minWidth: '10vh' }}>
                                                                    {sampleCode}
                                                                </td>
                                                                <td className="text-left">{item.type}</td>

                                                                {columns?.map(col => {
                                                                    const result = results.find(
                                                                        r => r.laboratorySetting?.laboratoryId === col.laboratoryId
                                                                    );

                                                                    return result ? (
                                                                        <React.Fragment key={col.laboratoryId}>
                                                                            {/* preValue cell */}
                                                                            <td className="text-left">
                                                                                {result.preValue !== null ? (
                                                                                    formatDecimal(result.preValue)
                                                                                ) : (
                                                                                    <GenButtonCircle
                                                                                        color="btn-warning text-white"
                                                                                        icon="fa fa-plus"
                                                                                        onClick={() => {
                                                                                            openEditModal(
                                                                                                sampleCode,
                                                                                                [result],
                                                                                                'add'
                                                                                            );
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            </td>

                                                                            {/* postValue */}
                                                                            {col?.machineType?.type === MachineTypeTypes.RAW_VALUE ? null : (
                                                                                <td className="text-left">
                                                                                    {formatDecimal(result?.postValue ?? 0)}
                                                                                </td>
                                                                            )}

                                                                            {/* Grade color removed as per user request */}
                                                                        </React.Fragment>
                                                                    ) : (
                                                                        <React.Fragment key={col.laboratoryId}>
                                                                            <td>-</td>
                                                                            {col?.machineType?.type !== MachineTypeTypes.RAW_VALUE && <td>-</td>}
                                                                        </React.Fragment>
                                                                    );
                                                                })}

                                                                {/* Management */}
                                                                <td className="align-middle">
                                                                    <div className="d-flex justify-content-center gap-2">
                                                                        <div className="p-0">
                                                                            <GenButtonCircle
                                                                                color="btn-primary"
                                                                                icon="fa fa-edit"
                                                                                onClick={() =>
                                                                                    openEditModal(sampleCode, results, 'edit')
                                                                                }
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <GenButtonCircle
                                                                                color="btn-success"
                                                                                icon={B_LIST.print.icon}
                                                                                onClick={() => handlePrint(sampleCode, results)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    });

                                                    return rows;
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </DataTableWrapper>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {printQrCodeData && (
                <div style={{ display: 'none' }}>
                    <PrintQrCode
                        labels={printQrCodeData}
                        onClose={() => setPrintQrCodeData(null)}
                    />
                </div>
            )}

            {/* Bootstrap Modal */}
            {showModal && (
                <div
                    className="modal fade show"
                    style={{
                        display: 'block',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(2px)',
                    }}
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="editModalLabel"
                >
                    <div
                        className="modal-dialog modal-lg modal-dialog-centered"
                        role="document"
                    >
                        <div className="modal-content shadow-lg border-0 rounded-3">
                            {/* Header */}
                            <div className="modal-header bg-primary text-white border-0 rounded-top-3">
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-edit me-2"></i>
                                    <h5 className="modal-title mb-0" id="editModalLabel">
                                        แก้ไขค่าสำหรับตัวอย่าง:
                                        <span className="badge bg-light text-primary ms-2 rounded-pill">
                                            {editingSampleCode}
                                        </span>
                                    </h5>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    aria-label="Close"
                                    onClick={closeModal}
                                />
                            </div>

                            {/* Body */}
                            <div
                                className="modal-body p-4"
                                style={{ maxHeight: '60vh', overflowY: 'auto' }}
                            >
                                <div
                                    className="alert alert-light border-start border-primary border-4 bg-light"
                                    role="alert"
                                >
                                    <i className="fas fa-info-circle text-primary me-2"></i>
                                    <small className="text-muted">
                                        กรุณากรอกค่าที่ต้องการแก้ไขในแต่ละฟิลด์
                                    </small>
                                </div>

                                {editedResults && editedResults.length > 0 && (
                                    <div className="mb-5">
                                        <form>
                                            {editedResults.map(result => (
                                                <div
                                                    className="mb-3 p-3 bg-light rounded-3 border-start border-4 border-success"
                                                    key={result.analysisStandardResultId}
                                                >
                                                    <div className="row align-items-center">
                                                        <div className="col-4">
                                                            <label className="form-label fw-bold text-dark mb-0">
                                                                <i className="fas fa-flask me-2 text-success"></i>
                                                                {result.shortNameBefore}{' '}
                                                                {result.unitBefore
                                                                    ? `(${result.unitBefore})`
                                                                    : ``}
                                                            </label>
                                                        </div>
                                                        <div className="col-8">
                                                            <div className="input-group">
                                                                <input
                                                                    type="number"
                                                                    className="form-control form-control-lg border-2"
                                                                    style={{
                                                                        borderColor:
                                                                            result.preValue !== null
                                                                                ? '#28a745'
                                                                                : '#dee2e6',
                                                                        backgroundColor: '#fff',
                                                                        transition: 'all 0.3s ease',
                                                                    }}
                                                                    value={result.preValue ?? ''}
                                                                    placeholder="กรอกค่า..."
                                                                    onChange={e => {
                                                                        const val = parseFloat(e.target.value);
                                                                        setEditedResults(prev =>
                                                                            prev.map(r =>
                                                                                r.analysisStandardResultId === result.analysisStandardResultId
                                                                                    ? {
                                                                                        ...r,
                                                                                        preValue: isNaN(val) ? null : val,
                                                                                    }
                                                                                    : r
                                                                            )
                                                                        );
                                                                    }}
                                                                    onFocus={e => {
                                                                        e.target.style.borderColor = '#28a745';
                                                                        e.target.style.boxShadow =
                                                                            '0 0 0 0.2rem rgba(40,167,69,.25)';
                                                                    }}
                                                                    onBlur={e => {
                                                                        e.target.style.borderColor =
                                                                            result.preValue !== null
                                                                                ? '#28a745'
                                                                                : '#dee2e6';
                                                                        e.target.style.boxShadow = 'none';
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </form>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="modal-footer bg-light border-0 rounded-bottom-3 p-4">
                                <div className="d-flex gap-3 ms-auto">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-lg px-4 rounded-pill"
                                        onClick={closeModal}
                                        style={{ minWidth: '120px' }}
                                    >
                                        <i className="fas fa-times me-2"></i>
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-lg px-4 shadow rounded-pill"
                                        onClick={saveModalChanges}
                                        style={{
                                            minWidth: '120px',
                                            background: 'linear-gradient(45deg, #007bff, #0056b3)',
                                        }}
                                    >
                                        <i className="fas fa-save me-2"></i>
                                        บันทึก
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default StandardLabResultTable;
