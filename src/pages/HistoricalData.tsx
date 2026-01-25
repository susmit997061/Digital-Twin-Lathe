import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Filter, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { fetchHistoricalData, SensorDataPoint } from '@/services/api';
import { cn } from '@/lib/utils';

interface ColumnConfig {
  key: keyof SensorDataPoint;
  label: string;
  visible: boolean;
}

const initialColumns: ColumnConfig[] = [
  { key: 'timestamp', label: 'Timestamp', visible: true },
  { key: 'mean', label: 'Mean', visible: true },
  { key: 'median', label: 'Median', visible: true },
  { key: 'rms', label: 'RMS', visible: true },
  { key: 'stdDeviation', label: 'Std Deviation', visible: true },
  { key: 'variance', label: 'Variance', visible: true },
  { key: 'skewness', label: 'Skewness', visible: true },
  { key: 'kurtosis', label: 'Kurtosis', visible: true },
  { key: 'crestFactor', label: 'Crest Factor', visible: true },
  { key: 'stdError', label: 'Std Error', visible: true },
];

const ITEMS_PER_PAGE = 15;

const HistoricalData: React.FC = () => {
  const [data, setData] = useState<SensorDataPoint[]>([]);
  const [columns, setColumns] = useState<ColumnConfig[]>(initialColumns);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showColumnFilter, setShowColumnFilter] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const historicalData = await fetchHistoricalData();
      setData(historicalData);
    } catch (error) {
      console.error('Failed to load historical data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    const term = searchTerm.toLowerCase();
    return data.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(term)
      )
    );
  }, [data, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // Visible columns
  const visibleColumns = columns.filter(col => col.visible);

  // Toggle column visibility
  const toggleColumn = (key: keyof SensorDataPoint) => {
    setColumns(prev => 
      prev.map(col => 
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Show only specific column
  const showOnlyColumn = (key: keyof SensorDataPoint) => {
    setColumns(prev => 
      prev.map(col => ({
        ...col,
        visible: col.key === key || col.key === 'timestamp'
      }))
    );
  };

  // Show all columns
  const showAllColumns = () => {
    setColumns(prev => prev.map(col => ({ ...col, visible: true })));
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredData.map(row => {
      const exportRow: Record<string, any> = {};
      visibleColumns.forEach(col => {
        if (col.key === 'timestamp') {
          exportRow[col.label] = new Date(row[col.key]).toLocaleString();
        } else {
          exportRow[col.label] = row[col.key];
        }
      });
      return exportRow;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historical Data');
    XLSX.writeFile(wb, `sensor_data_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const formatValue = (value: any, key: keyof SensorDataPoint) => {
    if (key === 'timestamp') {
      return new Date(value).toLocaleString();
    }
    if (typeof value === 'number') {
      return value.toFixed(4);
    }
    return String(value);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Historical Data
            </h1>
            <p className="text-muted-foreground mt-1">
              View and export historical sensor readings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColumnFilter(!showColumnFilter)}
              className={cn(
                "border-border hover:bg-muted",
                showColumnFilter && "bg-muted border-primary"
              )}
            >
              <Filter className="w-4 h-4 mr-2" />
              Columns
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isLoading}
              className="border-border hover:bg-muted"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={exportToExcel}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </motion.div>

        {/* Column Filter Panel */}
        {showColumnFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="p-4 bg-card border-border">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-sm font-medium text-muted-foreground">Filter by column:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={showAllColumns}
                  className="text-xs h-7"
                >
                  Show All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {columns.filter(col => col.key !== 'timestamp').map(col => (
                  <div key={col.key} className="flex items-center gap-1">
                    <Button
                      variant={col.visible ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => toggleColumn(col.key)}
                      className={cn(
                        "text-xs h-8",
                        col.visible && "bg-primary/20 border-primary text-primary hover:bg-primary/30"
                      )}
                    >
                      {col.visible ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                      {col.label}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => showOnlyColumn(col.key)}
                      className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
                      title={`Show only ${col.label}`}
                    >
                      Only
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 bg-card border-border pl-4 pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card border-border overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    {visibleColumns.map(col => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i}>
                        {visibleColumns.map(col => (
                          <td key={col.key} className="px-4 py-3">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={visibleColumns.length}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        No data found
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((row, index) => (
                      <tr
                        key={index}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {visibleColumns.map(col => (
                          <td
                            key={col.key}
                            className={cn(
                              "px-4 py-3 text-sm whitespace-nowrap",
                              col.key === 'timestamp' 
                                ? "text-muted-foreground font-mono text-xs"
                                : "text-foreground font-mono"
                            )}
                          >
                            {formatValue(row[col.key], col.key)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!isLoading && filteredData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of{' '}
                  {filteredData.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 border-border"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 border-border"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="px-3 text-sm font-medium">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0 border-border"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0 border-border"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default HistoricalData;
