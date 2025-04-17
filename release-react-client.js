#!/usr/bin/env node
// MADE BY AI, I AM NOT RESPONSIBLE FOR THIS CODE!!!!!

'use strict';

const { existsSync, readFileSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const buildDir = join(__dirname, 'build', 'node_modules');

function prompt(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function publishPackage(packageDir, otp, dryRun) {
    const packageJsonPath = join(packageDir, 'package.json');
    if (!existsSync(packageJsonPath)) {
        throw new Error(`package.json not found in ${packageDir}`);
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const { name, version } = packageJson;

    console.log(`Publishing ${name}@${version}...`);

    let publishCmd = 'npm publish --access public';
    if (dryRun) {
        publishCmd += ' --dry-run';
    }
    if (otp) {
        publishCmd += ` --otp=${otp}`;
    }

    execSync(publishCmd, { cwd: packageDir, stdio: 'inherit' });

    console.log(`✅ Successfully published ${name}@${version}`);
}

async function main() {
    const dryRun = process.argv.includes('--dry-run');

    if (!existsSync(buildDir)) {
        console.error('❌ build/node_modules/react-client directory does not exist.');
        process.exit(1);
    }

    const otpArg = process.argv.find(arg => arg.startsWith('--otp='));
    const otp = otpArg ? otpArg.split('=')[1] : await prompt('Enter npm OTP (leave blank if not required): ');

    const packageDir = join(buildDir, 'react-client');
    try {
        await publishPackage(packageDir, otp, dryRun);
    } catch (error) {
        console.error(`❌ Failed to publish react-client:`, error.message);
        process.exit(1);
    }

    console.log('🎉 All packages published successfully!');
}

main().catch(error => {
    console.error('❌ An error occurred:', error);
    process.exit(1);
});