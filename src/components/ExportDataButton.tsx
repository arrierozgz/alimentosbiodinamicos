import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileSpreadsheet, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDataExport } from '@/hooks/useDataExport';

interface ExportDataButtonProps {
  variant?: 'default' | 'compact';
  showCSV?: boolean;
}

export function ExportDataButton({ variant = 'default', showCSV = true }: ExportDataButtonProps) {
  const { exporting, exportData, exportProductsCSV } = useDataExport();

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" disabled={exporting}>
            <Download className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => exportData()}>
            <FileJson className="h-4 w-4 mr-2" />
            Exportar todo (JSON)
          </DropdownMenuItem>
          {showCSV && (
            <DropdownMenuItem onClick={exportProductsCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar productos (CSV)
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={exporting}>
          <Download className="h-4 w-4" />
          {exporting ? 'Exportando...' : 'Exportar mis datos'}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => exportData()}>
          <FileJson className="h-4 w-4 mr-2" />
          Exportar todo (JSON)
          <span className="ml-auto text-xs text-muted-foreground">Completo</span>
        </DropdownMenuItem>
        {showCSV && (
          <DropdownMenuItem onClick={exportProductsCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar productos (CSV)
            <span className="ml-auto text-xs text-muted-foreground">Excel</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
