
export class MigrationLogger {
  private startTime: number;
  private verbose: boolean;

  constructor(verbose = true) {
    this.startTime = Date.now();
    this.verbose = verbose;
  }

  header(message: string) {
    console.log('\n' + '='.repeat(70));
    console.log(`  ${message}`);
    console.log('='.repeat(70) + '\n');
  }

  section(message: string) {
    console.log('\n' + `━━━ ${message} ━━━`);
  }

  success(message: string) {
    console.log('✓', message);
  }

  error(message: string) {
    console.log('✗', message);
  }

  warning(message: string) {
    console.log('⚠', message);
  }

  info(message: string) {
    console.log('ℹ', message);
  }

  debug(message: string) {
    if (this.verbose) {
      console.log('  →', message);
    }
  }

  progress(current: number, total: number, label = '') {
    const percent = Math.round((current / total) * 100);
    const filled = Math.floor(percent / 2);
    const empty = 50 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    process.stdout.write(`\r  ${bar} ${percent}% (${current}/${total}) ${label}   `);
    if (current === total) {
      console.log();
    }
  }

  summary(stats: any) {
    console.log('\n' + '='.repeat(70));
    console.log('  MIGRATION SUMMARY');
    console.log('='.repeat(70));

    for (const [language, data] of Object.entries(stats) as any) {
      console.log(`\n${data.languageName}:`);
      console.log(`  Total Verbs:       ${data.totalVerbs}`);
      console.log(`  ✓ Migrated:        ${data.migrated}`);
      console.log(`  ⏭  Skipped:         ${data.skipped}`);
      console.log(`  ✗ Failed:          ${data.failed}`);

      if (data.llmClassified !== undefined) {
        console.log(`  📊 Classification:`);
        console.log(`     Gemini: ${data.llmClassified}`);
        console.log(`     Rules:  ${data.ruleClassified}`);
      }

      if (data.errors.length > 0) {
        console.log('\n  Errors:');
        data.errors.slice(0, 5).forEach((err: any) => {
          console.log(`    • ${err.verb}: ${err.error}`);
        });
        if (data.errors.length > 5) {
          console.log(`    ... and ${data.errors.length - 5} more`);
        }
      }
    }

    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log('\n' + '='.repeat(70));
    console.log(`  Completed in ${elapsed}s`);
    console.log('='.repeat(70) + '\n');
  }
}
