import fs from 'fs';
import path from 'path';
/** 
    Function to copy and replace a directory
    * @param {string} src - directory to copy
    * @param {string} dest - directory to paste
    * @param {object} replace -  variables to replace
*/
export const copyAndReplaceDir = async (src, dest, replace) => {
    // Create the destination directory if it does not exist
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    // Read the source directory and copy its content to the destination
    let elements = fs.readdirSync(src);

    elements.forEach(element => {
        let srcPath = path.join(src, element);
        let destPath = path.join(dest, element);

        // Check if the element is a directory or a file
        let stat = fs.statSync(srcPath);
        if (stat.isDirectory()) {
            copyAndReplaceDir(srcPath, destPath, replace);
        } else {
            if (srcPath.endsWith('.template')) {
                let srcContent = fs.readFileSync(srcPath, 'utf8');
                destPath = destPath.split('.template').join('');

                Object.entries(replace).forEach(([k, v]) =>
                    srcContent = srcContent.replace(new RegExp(`{{${k}}}`, 'g'), v));

                fs.writeFileSync(destPath, srcContent);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }

        }
    });
}

export default { copyAndReplaceDir }