import XLSX from 'xlsx';
import {saveAs} from 'file-saver';

export default function exportExcel(fileName, val, ans, ansExample){ 
    // step 1. workbook 생성
    var wb = XLSX.utils.book_new();

    // step 2. 시트 만들기 
    var newWorksheet = excelHandler.getWorksheet(val, ans, ansExample);
    
    // step 3. workbook에 새로만든 워크시트에 이름을 주고 붙인다.  
    XLSX.utils.book_append_sheet(wb, newWorksheet, excelHandler.getSheetName(fileName));

    // step 4. 엑셀 파일 만들기 
    var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});

    // step 5. 엑셀 파일 내보내기 
    saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), excelHandler.getExcelFileName(fileName));
}

const circleNum = [0, '①', '②', '③', '④', '⑤'];

var excelHandler = {
		getExcelFileName : function(fileName){
            let d = new Date();
            return fileName + '_' 
                            + String(d.getYear() - 100) 
                            + String((d.getMonth() + 1 < 10 ? '0' : '') + String(parseInt(d.getMonth()) + 1)) 
                            + String((d.getDate() < 10 ? '0' : '') + d.getDate())
                            + '_' 
                            + String((d.getHours() < 10 ? '0' : '') + d.getHours())
                            + String((d.getMinutes() < 10 ? '0' : '') + d.getMinutes())
                            + '.xlsx';
		},
		getSheetName : function(fileName){
			return fileName;
		},
		getExcelData : function(val, ans, ansExample){
            let sheet = [];
            for (let i = 0; i < 21; i++) {
                let row = [];
                for (let j = 0; j < 20; j++) {
                    row.push(null);
                }
                sheet.push(row);
            }
            for (let i = 0; i < 4; i++) {
                sheet[0][3 * i] = '문항 번호';
                sheet[0][3 * i + 1] = '정답';
                sheet[0][3 * i + 2] = '배점';
            }
            for (let c = 0; c < 4; c++) {
                for (let r = 0; r < 5; r++) {
                    let p = c * 5 + r + 1;
                    sheet[r + 1][c * 3] = p;
                    sheet[r + 1][c * 3 + 1] = circleNum[ans[p]];
                }
            }
            sheet[7][0] = '답';
            sheet[8][0] = '답개수';
            for (let i = 1; i <= 5; i++) {
                sheet[7][i] = circleNum[i];
                sheet[8][i] = ans.reduce((p, c) => i === c ? p + 1 : p, 0);
            }

            sheet[0][13] = '문항 번호';
            sheet[0][14] = '맞는 보기';
            sheet[0][15] = '답';
            sheet[0][16] = '답 예시';
            for (let p = 1; p <= 20; p++) {
                sheet[p][13] = p;
                sheet[p][14] = val[p];
                sheet[p][15] = circleNum[ans[p]];
                sheet[p][16] = ansExample[p];
            }
			return sheet;
		},
		getWorksheet : function(val, ans, ansExample){
			return XLSX.utils.aoa_to_sheet(this.getExcelData(val, ans, ansExample));
		}
}
function s2ab(s) { 
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf);  //create uint8array as viewer
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;    
}