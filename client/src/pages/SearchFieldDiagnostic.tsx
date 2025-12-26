import { useState } from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';
import { SearchField } from '../ui/SearchField';

/**
 * Diagnostic page for SearchField VE
 * Validates that input has correct styling and no native box appearance
 */
export function SearchFieldDiagnostic() {
  const [value, setValue] = useState('');

  const checkInputStyles = () => {
    const searchFields = document.querySelectorAll('input[type="text"]');
    console.clear();
    console.log('=== SearchField Input Diagnostics ===\n');

    searchFields.forEach((input, index) => {
      const computed = window.getComputedStyle(input);
      const rect = input.getBoundingClientRect();

      const diagnostics = {
        index,
        id: input.id,
        rect: {
          width: rect.width,
          height: rect.height,
        },
        computed: {
          backgroundColor: computed.backgroundColor,
          borderTopWidth: computed.borderTopWidth,
          borderRightWidth: computed.borderRightWidth,
          borderBottomWidth: computed.borderBottomWidth,
          borderLeftWidth: computed.borderLeftWidth,
          outline: computed.outline,
          boxShadow: computed.boxShadow,
          width: computed.width,
          height: computed.height,
          flex: computed.flex,
          minWidth: computed.minWidth,
          padding: computed.padding,
          margin: computed.margin,
          appearance: computed.appearance,
          WebkitAppearance: (computed as any).WebkitAppearance,
        },
      };

      console.log(`Input ${index}:`, diagnostics);

      // Validations
      const checks = {
        backgroundIsTransparent: computed.backgroundColor === 'rgba(0, 0, 0, 0)' || computed.backgroundColor === 'transparent',
        borderIsZero: computed.borderTopWidth === '0px' && computed.borderBottomWidth === '0px',
        outlineIsNone: computed.outline === 'none' || computed.outlineWidth === '0px',
        boxShadowIsNone: computed.boxShadow === 'none',
        widthIsSufficient: rect.width > 100,
        appearanceIsNone: computed.appearance === 'none' || (computed as any).WebkitAppearance === 'none',
      };

      console.log(`Checks for Input ${index}:`, checks);

      const allPass = Object.values(checks).every(v => v);
      console.log(`\n${allPass ? '✅ PASS' : '❌ FAIL'}: Input ${index} styling is ${allPass ? 'correct' : 'INCORRECT'}\n`);

      if (!allPass) {
        console.warn('Failed checks:', Object.entries(checks).filter(([_, v]) => !v).map(([k]) => k));
      }
    });

    console.log(`\nTotal inputs found: ${searchFields.length}`);
    console.log('Expected: 1 input per SearchField');
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        SearchField Diagnostic
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button variant="contained" onClick={checkInputStyles}>
          Check Input Styles (Console)
        </Button>
      </Stack>

      <Typography variant="h6" gutterBottom>
        Empty SearchField
      </Typography>
      <Box sx={{ maxWidth: 400, mb: 4 }}>
        <SearchField
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type to search..."
          onClear={() => setValue('')}
        />
      </Box>

      <Typography variant="h6" gutterBottom>
        SearchField with value
      </Typography>
      <Box sx={{ maxWidth: 400, mb: 4 }}>
        <SearchField
          value="Sample text"
          onChange={() => {}}
          placeholder="Search..."
          onClear={() => {}}
        />
      </Box>

      <Typography variant="caption" display="block" sx={{ mt: 4 }}>
        Open console and click "Check Input Styles" to validate:
        <ul>
          <li>backgroundColor is transparent</li>
          <li>border widths are 0</li>
          <li>outline is none</li>
          <li>boxShadow is none</li>
          <li>width is sufficient (not collapsed)</li>
          <li>appearance is none (no native styling)</li>
        </ul>
      </Typography>
    </Box>
  );
}
