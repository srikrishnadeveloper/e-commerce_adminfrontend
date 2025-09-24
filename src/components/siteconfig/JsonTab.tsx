import React from 'react';
import { Button } from '../ui/button';
import { AlertCircle, FileText } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface JsonTabProps {
  jsonEditorValue: string;
  jsonError: string | null;
  handleJsonEditorChange: (value: string | undefined) => void;
  formatJsonEditor: () => void;
}

const JsonTab: React.FC<JsonTabProps> = ({
  jsonEditorValue,
  jsonError,
  handleJsonEditorChange,
  formatJsonEditor
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Raw JSON Editor</h3>
        <p className="text-sm text-muted-foreground">Edit the complete site configuration as JSON</p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={formatJsonEditor}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Format JSON
        </Button>
      </div>
    </div>

    {jsonError && (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium text-red-800">JSON Error</span>
        </div>
        <p className="text-sm text-red-700 mt-1">{jsonError}</p>
      </div>
    )}

    <div className="border border-border rounded-lg overflow-hidden">
      <Editor
        height="600px"
        defaultLanguage="json"
        value={jsonEditorValue}
        onChange={handleJsonEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
        }}
        theme="vs-light"
      />
    </div>

    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">JSON Editor Tips:</p>
          <ul className="mt-1 list-disc list-inside space-y-1">
            <li>Changes are automatically synced with the form-based interface</li>
            <li>Use the "Format JSON" button to properly format your JSON</li>
            <li>Invalid JSON will show an error message above</li>
            <li>All changes must be saved using the "Save Changes" button</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default JsonTab;
