// Array of input IDs for easy iteration
const inputIds = ['a', 'b', 'c', 'ab', 'ac', 'bc', 'abc', 'unionSize'];
let currentMode = 3; // 2 or 3 sets
let calculationHistory = JSON.parse(localStorage.getItem('pieCalculationHistory')) || [];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    updateInputStyles();
    loadTheme();
    loadHistory();
    updateExportButton();
    setMode(3); // Default to 3 sets
});

// --- MODE MANAGEMENT ---
function setMode(mode) {
    currentMode = mode;
    
    // Update mode buttons
    document.getElementById('mode2Set').classList.remove('bg-blue-100', 'border-blue-300');
    document.getElementById('mode3Set').classList.remove('bg-green-100', 'border-green-300');
    
    if (mode === 2) {
        document.getElementById('mode2Set').classList.add('bg-blue-200', 'border-blue-400');
        document.getElementById('mode3Set').classList.add('bg-green-100', 'border-green-300');
        
        // Hide 3-set specific elements
        document.getElementById('cContainer').classList.add('hidden');
        document.getElementById('acContainer').classList.add('hidden');
        document.getElementById('bcContainer').classList.add('hidden');
        document.getElementById('abcContainer').classList.add('hidden');
        
        // Update labels
        document.querySelector('label[for="unionSize"]').textContent = '|A ∪ B|:';
        document.getElementById('currentModeBadge').textContent = '2 Himpunan';
        
        // Update Venn diagrams
        document.getElementById('venn2Diagram').classList.remove('hidden');
        document.getElementById('venn3Diagram').classList.add('hidden');
        document.getElementById('zoneCaption2Sets').classList.remove('hidden');
        document.getElementById('zoneCaption3Sets').classList.add('hidden');
        
        // ✅ PERBAIKAN: Update judul section Irisan untuk mode 2 himpunan
        const intersectionTitle = document.getElementById('intersectionSection');
        if (intersectionTitle) {
            intersectionTitle.textContent = 'Irisan dan Union';
        }
        
    } else {
        document.getElementById('mode3Set').classList.add('bg-green-200', 'border-green-400');
        document.getElementById('mode2Set').classList.add('bg-blue-100', 'border-blue-300');
        
        // Show 3-set specific elements
        document.getElementById('cContainer').classList.remove('hidden');
        document.getElementById('acContainer').classList.remove('hidden');
        document.getElementById('bcContainer').classList.remove('hidden');
        document.getElementById('abcContainer').classList.remove('hidden');
        
        // Update labels
        document.querySelector('label[for="unionSize"]').textContent = '|A ∪ B ∪ C|:';
        document.getElementById('currentModeBadge').textContent = '3 Himpunan';
        
        // Update Venn diagrams
        document.getElementById('venn3Diagram').classList.remove('hidden');
        document.getElementById('venn2Diagram').classList.add('hidden');
        document.getElementById('zoneCaption3Sets').classList.remove('hidden');
        document.getElementById('zoneCaption2Sets').classList.add('hidden');
        
        // ✅ PERBAIKAN: Update judul section Irisan untuk mode 3 himpunan
        const intersectionTitle = document.getElementById('intersectionSection');
        if (intersectionTitle) {
            intersectionTitle.textContent = 'Irisan Tiga dan Union';
        }
    }
    
    // Reset form for new mode
    resetFormForMode();
}

function resetFormForMode() {
    if (currentMode === 2) {
        document.getElementById('totalPopulasi').value = '100';
        document.getElementById('a').value = '40';
        document.getElementById('b').value = '50';
        document.getElementById('c').value = '0';
        document.getElementById('ab').value = '20';
        document.getElementById('ac').value = '0';
        document.getElementById('bc').value = '0';
        document.getElementById('abc').value = '0';
        document.getElementById('unionSize').value = '-1';
    } else {
        document.getElementById('totalPopulasi').value = '150';
        document.getElementById('a').value = '55';
        document.getElementById('b').value = '80';
        document.getElementById('c').value = '60';
        document.getElementById('ab').value = '35';
        document.getElementById('ac').value = '30';
        document.getElementById('bc').value = '25';
        document.getElementById('abc').value = '10';
        document.getElementById('unionSize').value = '-1';
    }
    updateInputStyles();
}

// --- CUSTOM MESSAGE DISPLAY ---
function displayMessage(message, type = 'error') {
    const messageArea = document.getElementById('messageArea');
    messageArea.innerHTML = message;
    messageArea.classList.remove('hidden', 'bg-red-100', 'border-red-500', 'text-red-700', 'bg-yellow-100', 'border-yellow-500', 'text-yellow-700');
    
    if (type === 'error') {
        messageArea.classList.add('bg-red-100', 'border-red-500', 'text-red-700', 'border-l-4');
    } else if (type === 'warning') {
        messageArea.classList.add('bg-yellow-100', 'border-yellow-500', 'text-yellow-700', 'border-l-4');
    }
    document.getElementById('outputResult').style.display = 'none';
    messageArea.scrollIntoView({ behavior: 'smooth' });
}

function clearMessages() {
    document.getElementById('messageArea').classList.add('hidden');
}

// --- DYNAMIC INPUT STYLING ---
function updateInputStyles() {
    inputIds.forEach(id => {
        const input = document.getElementById(id);
        if (input && parseInt(input.value) === -1) {
            input.classList.add('unknown-input');
        } else if (input) {
            input.classList.remove('unknown-input');
        }
    });
}

// --- FUNGSI UTAMA ---
function hitungPIE() {
    clearMessages();
    
    // Ambil nilai dari input dan parse sebagai integer
    const totalPopulasi = parseInt(document.getElementById('totalPopulasi').value) || 0;
    const inputs = {};
    inputIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            inputs[id] = parseInt(element.value) || 0;
        }
    });
    const { a, b, c, ab, ac, bc, abc, unionSize } = inputs;
    
    // Validasi input berdasarkan mode
    const validation = currentMode === 2 ? 
        validasiInput2Set(totalPopulasi, a, b, ab, unionSize) :
        validasiInput3Set(totalPopulasi, a, b, c, ab, ac, bc, abc, unionSize);
    
    if (!validation.valid) {
        displayMessage(validation.message, 'error');
        return;
    }

    // Hitung nilai yang tidak diketahui
    const result = currentMode === 2 ?
        hitungNilaiTidakDiketahui2Set(totalPopulasi, a, b, ab, unionSize) :
        hitungNilaiTidakDiketahui3Set(totalPopulasi, a, b, c, ab, ac, bc, abc, unionSize);
    
    if (result) {
        // Lakukan validasi konsistensi data sebelum menampilkan
        if (result.finalValidation.hasNegative || result.finalValidation.total_mismatch) {
            displayMessage(result.finalValidation.message, 'warning');
        }
        tampilkanHasilLengkap(result);
    }
}

// --- VALIDASI INPUT 3 SET ---
function validasiInput3Set(totalPopulasi, a, b, c, ab, ac, bc, abc, unionSize) {
    const inputs = [a, b, c, ab, ac, bc, abc, unionSize];
    const unknownCount = inputs.filter(val => val === -1).length;

    if (unknownCount !== 1) {
        return { valid: false, message: '<strong>ERROR:</strong> Masukkan <strong>tepat SATU</strong> nilai -1 untuk variabel yang ingin dicari.' };
    }

    const allValues = [totalPopulasi, ...inputs.filter(val => val !== -1)];
    for (let val of allValues) {
        if (val < 0) {
            return { valid: false, message: '<strong>ERROR:</strong> Nilai tidak boleh negatif, kecuali -1 untuk variabel yang dicari!' };
        }
    }
    
    if (totalPopulasi < 0) {
        return { valid: false, message: '<strong>ERROR:</strong> Total populasi (U) harus lebih besar dari atau sama dengan 0!' };
    }

    return { valid: true, message: '' };
}

// --- VALIDASI INPUT 2 SET ---
function validasiInput2Set(totalPopulasi, a, b, ab, unionSize) {
    const inputs = [a, b, ab, unionSize];
    const unknownCount = inputs.filter(val => val === -1).length;

    if (unknownCount !== 1) {
        return { valid: false, message: '<strong>ERROR:</strong> Masukkan <strong>tepat SATU</strong> nilai -1 untuk variabel yang ingin dicari.' };
    }

    const allValues = [totalPopulasi, ...inputs.filter(val => val !== -1)];
    for (let val of allValues) {
        if (val < 0) {
            return { valid: false, message: '<strong>ERROR:</strong> Nilai tidak boleh negatif, kecuali -1 untuk variabel yang dicari!' };
        }
    }
    
    if (totalPopulasi < 0) {
        return { valid: false, message: '<strong>ERROR:</strong> Total populasi (U) harus lebih besar dari atau sama dengan 0!' };
    }

    return { valid: true, message: '' };
}

// --- HITUNG NILAI TIDAK DIKETAHUI 3 SET ---
function hitungNilaiTidakDiketahui3Set(totalPopulasi, a, b, c, ab, ac, bc, abc, unionSize) {
    let unknown_name = '';
    let unknown_value = 0;
    let calculation = '';
    let basic_formula = '';

    try {
        // Rumus Dasar PIE 3 Set: |A ∪ B ∪ C| = |A| + |B| + |C| - (|A ∩ B| + |A ∩ C| + |B ∩ C|) + |A ∩ B ∩ C|
        const A = a === -1 ? 0 : a;
        const B = b === -1 ? 0 : b;
        const C = c === -1 ? 0 : c;
        const AB = ab === -1 ? 0 : ab;
        const AC = ac === -1 ? 0 : ac;
        const BC = bc === -1 ? 0 : bc;
        const ABC = abc === -1 ? 0 : abc;
        const U = unionSize === -1 ? 0 : unionSize;

        if (unionSize === -1) {
            unknown_value = Math.round(A + B + C - AB - AC - BC + ABC);
            unknown_name = '|A ∪ B ∪ C|';
            calculation = `${A} + ${B} + ${C} - ${AB} - ${AC} - ${BC} + ${ABC} = ${unknown_value}`;
            basic_formula = '|A ∪ B ∪ C| = |A| + |B| + |C| - |A ∩ B| - |A ∩ C| - |B ∩ C| + |A ∩ B ∩ C|';
        } 
        else if (a === -1) {
            unknown_value = Math.round(U - B - C + AB + AC + BC - ABC);
            unknown_name = '|A|';
            calculation = `${U} - ${B} - ${C} + ${AB} + ${AC} + ${BC} - ${ABC} = ${unknown_value}`;
            basic_formula = '|A| = |A ∪ B ∪ C| - |B| - |C| + |A ∩ B| + |A ∩ C| + |B ∩ C| - |A ∩ B ∩ C|';
        } else if (b === -1) {
            unknown_value = Math.round(U - A - C + AB + BC + AC - ABC);
            unknown_name = '|B|';
            calculation = `${U} - ${A} - ${C} + ${AB} + ${BC} + ${AC} - ${ABC} = ${unknown_value}`;
            basic_formula = '|B| = |A ∪ B ∪ C| - |A| - |C| + |A ∩ B| + |B ∩ C| + |A ∩ C| - |A ∩ B ∩ C|';
        } else if (c === -1) {
            unknown_value = Math.round(U - A - B + AC + BC + AB - ABC);
            unknown_name = '|C|';
            calculation = `${U} - ${A} - ${B} + ${AC} + ${BC} + ${AB} - ${ABC} = ${unknown_value}`;
            basic_formula = '|C| = |A ∪ B ∪ C| - |A| - |B| + |A ∩ C| + |B ∩ C| + |A ∩ B| - |A ∩ B ∩ C|';
        } 
        else if (ab === -1) {
            unknown_value = Math.round(A + B + C - AC - BC + ABC - U);
            unknown_name = '|A ∩ B|';
            calculation = `${A} + ${B} + ${C} - ${AC} - ${BC} + ${ABC} - ${U} = ${unknown_value}`;
            basic_formula = '|A ∩ B| = |A| + |B| + |C| - |A ∩ C| - |B ∩ C| + |A ∩ B ∩ C| - |A ∪ B ∪ C|';
        } else if (ac === -1) {
            unknown_value = Math.round(A + C + B - AB - BC + ABC - U);
            unknown_name = '|A ∩ C|';
            calculation = `${A} + ${C} + ${B} - ${AB} - ${BC} + ${ABC} - ${U} = ${unknown_value}`;
            basic_formula = '|A ∩ C| = |A| + |C| + |B| - |A ∩ B| - |B ∩ C| + |A ∩ B ∩ C| - |A ∪ B ∪ C|';
        } else if (bc === -1) {
            unknown_value = Math.round(B + C + A - AB - AC + ABC - U);
            unknown_name = '|B ∩ C|';
            calculation = `${B} + ${C} + ${A} - ${AB} - ${AC} + ${ABC} - ${U} = ${unknown_value}`;
            basic_formula = '|B ∩ C| = |B| + |C| + |A| - |A ∩ B| - |A ∩ C| + |A ∩ B ∩ C| - |A ∪ B ∪ C|';
        } 
        else if (abc === -1) {
            unknown_value = Math.round(U - A - B - C + AB + AC + BC);
            unknown_name = '|A ∩ B ∩ C|';
            calculation = `${U} - ${A} - ${B} - ${C} + ${AB} + ${AC} + ${BC} = ${unknown_value}`;
            basic_formula = '|A ∩ B ∩ C| = |A ∪ B ∪ C| - |A| - |B| - |C| + |A ∩ B| + |A ∩ C| + |B ∩ C|';
        }

        const fullData = {
            total_populasi: totalPopulasi,
            a: a === -1 ? unknown_value : a,
            b: b === -1 ? unknown_value : b,
            c: c === -1 ? unknown_value : c,
            ab: ab === -1 ? unknown_value : ab,
            ac: ac === -1 ? unknown_value : ac,
            bc: bc === -1 ? unknown_value : bc,
            abc: abc === -1 ? unknown_value : abc,
            union_size: unionSize === -1 ? unknown_value : unionSize,
            unknown_name: unknown_name,
            unknown_value: unknown_value,
            calculation: calculation,
            basic_formula: basic_formula,
            mode: 3
        };

        const finalValidation = validateFullData3Set(fullData);
        return { ...fullData, finalValidation };

    } catch (error) {
        displayMessage('<strong>ERROR:</strong> Terjadi kesalahan dalam proses perhitungan. ' + error.message, 'error');
        return null;
    }
}

// --- HITUNG NILAI TIDAK DIKETAHUI 2 SET ---
function hitungNilaiTidakDiketahui2Set(totalPopulasi, a, b, ab, unionSize) {
    let unknown_name = '';
    let unknown_value = 0;
    let calculation = '';
    let basic_formula = '';

    try {
        // Rumus Dasar PIE 2 Set: |A ∪ B| = |A| + |B| - |A ∩ B|
        const A = a === -1 ? 0 : a;
        const B = b === -1 ? 0 : b;
        const AB_val = ab === -1 ? 0 : ab;
        const U = unionSize === -1 ? 0 : unionSize;

        if (unionSize === -1) {
            unknown_value = Math.round(A + B - AB_val);
            unknown_name = '|A ∪ B|';
            calculation = `${A} + ${B} - ${AB_val} = ${unknown_value}`;
            basic_formula = '|A ∪ B| = |A| + |B| - |A ∩ B|';
        } 
        else if (a === -1) {
            unknown_value = Math.round(U - B + AB_val);
            unknown_name = '|A|';
            calculation = `${U} - ${B} + ${AB_val} = ${unknown_value}`;
            basic_formula = '|A| = |A ∪ B| - |B| + |A ∩ B|';
        } else if (b === -1) {
            unknown_value = Math.round(U - A + AB_val);
            unknown_name = '|B|';
            calculation = `${U} - ${A} + ${AB_val} = ${unknown_value}`;
            basic_formula = '|B| = |A ∪ B| - |A| + |A ∩ B|';
        } 
        else if (ab === -1) {
            unknown_value = Math.round(A + B - U);
            unknown_name = '|A ∩ B|';
            calculation = `${A} + ${B} - ${U} = ${unknown_value}`;
            basic_formula = '|A ∩ B| = |A| + |B| - |A ∪ B|';
        }

        const fullData = {
            total_populasi: totalPopulasi,
            a: a === -1 ? unknown_value : a,
            b: b === -1 ? unknown_value : b,
            ab: ab === -1 ? unknown_value : ab,
            union_size: unionSize === -1 ? unknown_value : unionSize,
            unknown_name: unknown_name,
            unknown_value: unknown_value,
            calculation: calculation,
            basic_formula: basic_formula,
            mode: 2
        };

        const finalValidation = validateFullData2Set(fullData);
        return { ...fullData, finalValidation };

    } catch (error) {
        displayMessage('<strong>ERROR:</strong> Terjadi kesalahan dalam proses perhitungan. ' + error.message, 'error');
        return null;
    }
}

// --- VALIDASI AKHIR KONSISTENSI DATA 3 SET ---
function validateFullData3Set(result) {
    const zona = hitungSemuaZona3Set(result);
    
    let hasNegative = zona.AB_saja < 0 || zona.AC_saja < 0 || zona.BC_saja < 0 || 
                     zona.A_saja < 0 || zona.B_saja < 0 || zona.C_saja < 0 || 
                     zona.tidak_memilih < 0;
    
    const total_populasi_mismatch = result.union_size > result.total_populasi;

    let message = '';
    let is_invalid = false;

    if (hasNegative) {
         message += `⚠️ <strong>Data Tidak Konsisten!</strong> Beberapa zona memiliki nilai negatif. Cek kembali semua input Anda. `;
         is_invalid = true;
    }
    
    if (total_populasi_mismatch) {
         message += `⚠️ <strong>Total Populasi Mismatch:</strong> Gabungan himpunan (${result.union_size}) melebihi Total Populasi (${result.total_populasi}). `;
         is_invalid = true;
    }

    if (is_invalid) {
        return { hasNegative: is_invalid, total_mismatch: is_invalid, message: message };
    }

    return { hasNegative: false, total_mismatch: false, message: 'Data konsisten dan valid.' };
}

// --- VALIDASI AKHIR KONSISTENSI DATA 2 SET ---
function validateFullData2Set(result) {
    const zona = hitungSemuaZona2Set(result);
    
    let hasNegative = zona.A_saja < 0 || zona.B_saja < 0 || zona.tidak_memilih < 0;
    const total_populasi_mismatch = result.union_size > result.total_populasi;

    let message = '';
    let is_invalid = false;

    if (hasNegative) {
         message += `⚠️ <strong>Data Tidak Konsisten!</strong> Beberapa zona memiliki nilai negatif. Cek kembali semua input Anda. `;
         is_invalid = true;
    }
    
    if (total_populasi_mismatch) {
         message += `⚠️ <strong>Total Populasi Mismatch:</strong> Gabungan himpunan (${result.union_size}) melebihi Total Populasi (${result.total_populasi}). `;
         is_invalid = true;
    }

    if (is_invalid) {
        return { hasNegative: is_invalid, total_mismatch: is_invalid, message: message };
    }

    return { hasNegative: false, total_mismatch: false, message: 'Data konsisten dan valid.' };
}

// --- HITUNG SEMUA ZONA 3 SET ---
function hitungSemuaZona3Set(result) {
    const AB_saja = Math.round(result.ab - result.abc);
    const AC_saja = Math.round(result.ac - result.abc);
    const BC_saja = Math.round(result.bc - result.abc);
    const hanya_dua_total = AB_saja + AC_saja + BC_saja;
    
    const A_saja = Math.round(result.a - (AB_saja + AC_saja + result.abc));
    const B_saja = Math.round(result.b - (AB_saja + BC_saja + result.abc));
    const C_saja = Math.round(result.c - (AC_saja + BC_saja + result.abc));
    const hanya_satu_total = A_saja + B_saja + C_saja;
    
    const tidak_memilih = Math.round(result.total_populasi - result.union_size);

    return {
        AB_saja, AC_saja, BC_saja, hanya_dua_total,
        A_saja, B_saja, C_saja, hanya_satu_total,
        tidak_memilih,
    };
}

// --- HITUNG SEMUA ZONA 2 SET ---
function hitungSemuaZona2Set(result) {
    const A_saja = Math.round(result.a - result.ab);
    const B_saja = Math.round(result.b - result.ab);
    const tidak_memilih = Math.round(result.total_populasi - result.union_size);

    return {
        A_saja, B_saja, tidak_memilih
    };
}

// --- TAMPILKAN HASIL LENGKAP ---
function tampilkanHasilLengkap(result) {
    const resultContent = document.getElementById('resultContent');
    const outputResult = document.getElementById('outputResult');
    outputResult.classList.remove('border-red-500', 'border-yellow-500', 'bg-red-50', 'bg-yellow-50');
    outputResult.classList.add('border-green-500');

    let html = '';
    let zona = {};
    let total_dari_zona = 0;
    let total_is_consistent = false;

    if (result.mode === 3) {
        zona = hitungSemuaZona3Set(result);
        total_dari_zona = Math.round(result.abc + zona.hanya_dua_total + zona.hanya_satu_total);
        total_is_consistent = total_dari_zona === result.union_size;
        
        html = generateResultHTML3Set(result, zona, total_dari_zona, total_is_consistent);
        updateVennDiagram3Set(result, zona);
    } else {
        zona = hitungSemuaZona2Set(result);
        total_dari_zona = Math.round(result.ab + zona.A_saja + zona.B_saja);
        total_is_consistent = total_dari_zona === result.union_size;
        
        html = generateResultHTML2Set(result, zona, total_dari_zona, total_is_consistent);
        updateVennDiagram2Set(result, zona);
    }

    resultContent.innerHTML = html;
    outputResult.style.display = 'block';
    updateExportButton();
    
    // Gulir ke hasil
    outputResult.scrollIntoView({ behavior: 'smooth' });
}

// --- GENERATE HTML RESULTS 3 SET ---
function generateResultHTML3Set(result, zona, total_dari_zona, total_is_consistent) {
    return `
        <div class="p-3 bg-green-100 text-green-800 rounded-lg mb-4">
            <strong class="text-xl">✅ ${result.unknown_name} = ${result.unknown_value}</strong>
        </div>

        <div class="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg mb-4">
            <strong class="block text-yellow-800 mb-1">📝 Rumus Dasar:</strong>
            <p class="text-formula text-yellow-900 font-mono text-sm mb-2">${result.basic_formula}</p>
            <strong class="block text-yellow-800 mb-1 mt-3">🔢 Substitusi & Perhitungan:</strong>
            <p class="text-formula text-yellow-900">${result.calculation}</p>
        </div>

        <h4 class="text-xl font-semibold text-gray-700 mt-6 mb-2">Ringkasan Utama</h4>
        <table class="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead class="bg-blue-600 text-white">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Metrik</th>
                    <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Nilai</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <tr class="bg-blue-50 font-bold">
                    <td class="px-6 py-4 whitespace-nowrap text-blue-800">Total Populasi (U)</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-blue-800">${result.total_populasi}</td>
                </tr>
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">|A ∪ B ∪ C| (Gabungan)</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right font-semibold">${result.union_size}</td>
                </tr>
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">|A ∩ B ∩ C| (Irisan Ketiga)</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">${result.abc}</td>
                </tr>
                <tr class="${zona.tidak_memilih < 0 ? 'bg-red-100 font-bold' : 'bg-green-50 font-bold'}">
                    <td class="px-6 py-4 whitespace-nowrap text-green-800">Tidak Memilih Sama Sekali (A U B U C)'</td> 
                    <td class="px-6 py-4 whitespace-nowrap text-right ${zona.tidak_memilih < 0 ? 'text-red-700' : 'text-green-700'}">${zona.tidak_memilih}</td>
                </tr>
            </tbody>
        </table>

        <h4 class="text-xl font-semibold text-gray-700 mt-6 mb-2">Rincian Zona - Hanya Dua Himpunan</h4>
        <table class="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead class="bg-gray-100">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zona</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perhitungan</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <tr class="${zona.AB_saja < 0 ? 'bg-red-50' : ''}">
                    <td class="px-6 py-4 whitespace-nowrap">Hanya |A ∩ B| saja</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right ${zona.AB_saja < 0 ? 'text-red-700 font-bold' : ''}">${zona.AB_saja}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-formula">${result.ab} - ${result.abc} = ${zona.AB_saja}</td>
                </tr>
                <tr class="${zona.AC_saja < 0 ? 'bg-red-50' : ''}">
                    <td class="px-6 py-4 whitespace-nowrap">Hanya |A ∩ C| saja</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right ${zona.AC_saja < 0 ? 'text-red-700 font-bold' : ''}">${zona.AC_saja}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-formula">${result.ac} - ${result.abc} = ${zona.AC_saja}</td>
                </tr>
                <tr class="${zona.BC_saja < 0 ? 'bg-red-50' : ''}">
                    <td class="px-6 py-4 whitespace-nowrap">Hanya |B ∩ C| saja</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right ${zona.BC_saja < 0 ? 'text-red-700 font-bold' : ''}">${zona.BC_saja}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-formula">${result.bc} - ${result.abc} = ${zona.BC_saja}</td>
                </tr>
                <tr class="bg-gray-200 font-bold">
                    <td class="px-6 py-4 whitespace-nowrap">Total Hanya Dua</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">${zona.hanya_dua_total}</td>
                    <td class="px-6 py-4 whitespace-nowrap"></td>
                </tr>
            </tbody>
        </table>

        <h4 class="text-xl font-semibold text-gray-700 mt-6 mb-2">Rincian Zona - Hanya Satu Himpunan</h4>
        <table class="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead class="bg-gray-100">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zona</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perhitungan</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <tr class="${zona.A_saja < 0 ? 'bg-red-50' : ''}">
                    <td class="px-6 py-4 whitespace-nowrap">Hanya |A| saja</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right ${zona.A_saja < 0 ? 'text-red-700 font-bold' : ''}">${zona.A_saja}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-formula">${result.a} - (${zona.AB_saja} + ${zona.AC_saja} + ${result.abc}) = ${zona.A_saja}</td>
                </tr>
                <tr class="${zona.B_saja < 0 ? 'bg-red-50' : ''}">
                    <td class="px-6 py-4 whitespace-nowrap">Hanya |B| saja</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right ${zona.B_saja < 0 ? 'text-red-700 font-bold' : ''}">${zona.B_saja}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-formula">${result.b} - (${zona.AB_saja} + ${zona.BC_saja} + ${result.abc}) = ${zona.B_saja}</td>
                </tr>
                <tr class="${zona.C_saja < 0 ? 'bg-red-50' : ''}">
                    <td class="px-6 py-4 whitespace-nowrap">Hanya |C| saja</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right ${zona.C_saja < 0 ? 'text-red-700 font-bold' : ''}">${zona.C_saja}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-formula">${result.c} - (${zona.AC_saja} + ${zona.BC_saja} + ${result.abc}) = ${zona.C_saja}</td>
                </tr>
                <tr class="bg-gray-200 font-bold">
                    <td class="px-6 py-4 whitespace-nowrap">Total Hanya Satu</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">${zona.hanya_satu_total}</td>
                    <td class="px-6 py-4 whitespace-nowrap"></td>
                </tr>
            </tbody>
        </table>

        ${generateValidationHTML(total_dari_zona, result.union_size, total_is_consistent)}
    `;
}

// --- GENERATE HTML RESULTS 2 SET ---
function generateResultHTML2Set(result, zona, total_dari_zona, total_is_consistent) {
    return `
        <div class="p-3 bg-green-100 text-green-800 rounded-lg mb-4">
            <strong class="text-xl">✅ ${result.unknown_name} = ${result.unknown_value}</strong>
        </div>

        <div class="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg mb-4">
            <strong class="block text-yellow-800 mb-1">📝 Rumus Dasar:</strong>
            <p class="text-formula text-yellow-900 font-mono text-sm mb-2">${result.basic_formula}</p>
            <strong class="block text-yellow-800 mb-1 mt-3">🔢 Substitusi & Perhitungan:</strong>
            <p class="text-formula text-yellow-900">${result.calculation}</p>
        </div>

        <h4 class="text-xl font-semibold text-gray-700 mt-6 mb-2">Ringkasan Utama</h4>
        <table class="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead class="bg-blue-600 text-white">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Metrik</th>
                    <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Nilai</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <tr class="bg-blue-50 font-bold">
                    <td class="px-6 py-4 whitespace-nowrap text-blue-800">Total Populasi (U)</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-blue-800">${result.total_populasi}</td>
                </tr>
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">|A ∪ B| (Gabungan)</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right font-semibold">${result.union_size}</td>
                </tr>
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">|A ∩ B| (Irisan)</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">${result.ab}</td>
                </tr>
                <tr class="${zona.tidak_memilih < 0 ? 'bg-red-100 font-bold' : 'bg-green-50 font-bold'}">
                    <td class="px-6 py-4 whitespace-nowrap text-green-800">Tidak Memilih Sama Sekali (A U B)'</td> 
                    <td class="px-6 py-4 whitespace-nowrap text-right ${zona.tidak_memilih < 0 ? 'text-red-700' : 'text-green-700'}">${zona.tidak_memilih}</td>
                </tr>
            </tbody>
        </table>

        <h4 class="text-xl font-semibold text-gray-700 mt-6 mb-2">Rincian Zona</h4>
        <table class="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
            <thead class="bg-gray-100">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zona</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perhitungan</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <tr class="${zona.A_saja < 0 ? 'bg-red-50' : ''}">
                    <td class="px-6 py-4 whitespace-nowrap">Hanya |A| saja</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right ${zona.A_saja < 0 ? 'text-red-700 font-bold' : ''}">${zona.A_saja}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-formula">${result.a} - ${result.ab} = ${zona.A_saja}</td>
                </tr>
                <tr class="${zona.B_saja < 0 ? 'bg-red-50' : ''}">
                    <td class="px-6 py-4 whitespace-nowrap">Hanya |B| saja</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right ${zona.B_saja < 0 ? 'text-red-700 font-bold' : ''}">${zona.B_saja}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-formula">${result.b} - ${result.ab} = ${zona.B_saja}</td>
                </tr>
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">|A ∩ B| (Irisan)</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">${result.ab}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-formula">Langsung dari input</td>
                </tr>
                <tr class="bg-gray-200 font-bold">
                    <td class="px-6 py-4 whitespace-nowrap">Total Gabungan</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">${result.union_size}</td>
                    <td class="px-6 py-4 whitespace-nowrap"></td>
                </tr>
            </tbody>
        </table>

        ${generateValidationHTML(total_dari_zona, result.union_size, total_is_consistent)}
    `;
}

// --- GENERATE VALIDATION HTML ---
function generateValidationHTML(total_dari_zona, union_size, total_is_consistent) {
    const statusClass = total_is_consistent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const statusText = total_is_consistent ? '✓ SESUAI' : '✗ TIDAK SESUAI';
    
    return `
        <h4 class="text-xl font-semibold text-gray-700 mt-6 mb-2">Validasi Total</h4>
        <div class="p-3 ${statusClass} rounded-lg mt-4 font-bold">
            <p>Total Union dari Penjumlahan Zona: <span class="float-right">${total_dari_zona}</span></p>
            <p>Union yang Diperoleh: <span class="float-right">${union_size}</span></p>
            <p class="mt-2 pt-2 border-t border-current">Status Validasi Union: <span class="float-right">${statusText}</span></p>
        </div>
    `;
}

// --- UPDATE VENN DIAGRAM 3 SET ---
function updateVennDiagram3Set(result, zona) {
    document.getElementById('zone-A-saja').textContent = zona.A_saja;
    document.getElementById('zone-B-saja').textContent = zona.B_saja;
    document.getElementById('zone-C-saja').textContent = zona.C_saja;
    document.getElementById('zone-AB-saja').textContent = zona.AB_saja;
    document.getElementById('zone-AC-saja').textContent = zona.AC_saja;
    document.getElementById('zone-BC-saja').textContent = zona.BC_saja;
    document.getElementById('zone-ABC').textContent = result.abc;
    document.getElementById('zone-luar').textContent = zona.tidak_memilih;

    // Update captions
    document.getElementById('caption-A-saja').textContent = zona.A_saja;
    document.getElementById('caption-B-saja').textContent = zona.B_saja;
    document.getElementById('caption-C-saja').textContent = zona.C_saja;
    document.getElementById('caption-AB-saja').textContent = zona.AB_saja;
    document.getElementById('caption-AC-saja').textContent = zona.AC_saja;
    document.getElementById('caption-BC-saja').textContent = zona.BC_saja;
    document.getElementById('caption-ABC').textContent = result.abc;
    document.getElementById('caption-luar').textContent = zona.tidak_memilih;

    // Update colors for negative values
    updateVennColors3Set(zona);
}

// --- UPDATE VENN DIAGRAM 2 SET ---
function updateVennDiagram2Set(result, zona) {
    document.getElementById('zone2-A-saja').textContent = zona.A_saja;
    document.getElementById('zone2-B-saja').textContent = zona.B_saja;
    document.getElementById('zone2-AB').textContent = result.ab;
    document.getElementById('zone2-luar').textContent = zona.tidak_memilih;

    // Update captions
    document.getElementById('caption2-A-saja').textContent = zona.A_saja;
    document.getElementById('caption2-B-saja').textContent = zona.B_saja;
    document.getElementById('caption2-AB').textContent = result.ab;
    document.getElementById('caption2-luar').textContent = zona.tidak_memilih;

    // Update colors for negative values
    updateVennColors2Set(zona, result);
}

// --- UPDATE VENN COLORS 3 SET ---
function updateVennColors3Set(zona) {
    const zones = ['A-saja', 'B-saja', 'C-saja', 'AB-saja', 'AC-saja', 'BC-saja', 'luar'];
    zones.forEach(zone => {
        const element = document.getElementById(`zone-${zone}`);
        if (element) {
            element.style.fill = '#1f2937';
        }
    });

    if (zona.A_saja < 0) document.getElementById('zone-A-saja').style.fill = '#b91c1c';
    if (zona.B_saja < 0) document.getElementById('zone-B-saja').style.fill = '#b91c1c';
    if (zona.C_saja < 0) document.getElementById('zone-C-saja').style.fill = '#b91c1c';
    if (zona.AB_saja < 0) document.getElementById('zone-AB-saja').style.fill = '#b91c1c';
    if (zona.AC_saja < 0) document.getElementById('zone-AC-saja').style.fill = '#b91c1c';
    if (zona.BC_saja < 0) document.getElementById('zone-BC-saja').style.fill = '#b91c1c';
    if (zona.tidak_memilih < 0) document.getElementById('zone-luar').style.fill = '#b91c1c';
}

// --- UPDATE VENN COLORS 2 SET ---
function updateVennColors2Set(zona, result) {
    const zones = ['A-saja', 'B-saja', 'luar'];
    zones.forEach(zone => {
        const element = document.getElementById(`zone2-${zone}`);
        if (element) {
            element.style.fill = '#1f2937';
        }
    });

    if (zona.A_saja < 0) document.getElementById('zone2-A-saja').style.fill = '#b91c1c';
    if (zona.B_saja < 0) document.getElementById('zone2-B-saja').style.fill = '#b91c1c';
    if (zona.tidak_memilih < 0) document.getElementById('zone2-luar').style.fill = '#b91c1c';
}

// --- THEME MANAGEMENT ---
function loadTheme() {
    const savedTheme = localStorage.getItem('pieTheme') || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pieTheme', theme);
    
    const themeIcon = document.querySelector('#themeToggle i');
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
        document.body.classList.add('dark-mode');
    } else {
        themeIcon.className = 'fas fa-moon';
        document.body.classList.remove('dark-mode');
    }
}

function toggleTheme() {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
}

// --- LOADING MANAGEMENT ---
function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// --- HISTORY MANAGEMENT ---
function loadHistory() {
    const historyContent = document.getElementById('historyContent');
    const historySection = document.getElementById('historySection');
    
    if (calculationHistory.length === 0) {
        historyContent.innerHTML = '<p class="text-gray-500 text-center py-4">Belum ada riwayat perhitungan</p>';
        historySection.classList.add('hidden');
        return;
    }
    
    historySection.classList.remove('hidden');
    historyContent.innerHTML = calculationHistory.map((item, index) => `
        <div class="p-3 border-b border-gray-200 hover:bg-gray-50">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <p class="font-semibold text-blue-600">${item.unknown_name} = ${item.unknown_value}</p>
                    <p class="text-sm text-gray-600 mt-1">${new Date(item.timestamp).toLocaleString()}</p>
                    <p class="text-xs text-gray-500 font-mono mt-1">${item.calculation}</p>
                </div>
                <button onclick="loadFromHistory(${index})" class="ml-2 p-1 text-blue-600 hover:text-blue-800" title="Load perhitungan">
                    <i class="fas fa-undo"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function addToHistory(result) {
    const historyItem = {
        ...result,
        timestamp: new Date().toISOString(),
        inputs: getCurrentInputs()
    };
    
    calculationHistory.unshift(historyItem);
    if (calculationHistory.length > 10) {
        calculationHistory = calculationHistory.slice(0, 10);
    }
    
    localStorage.setItem('pieCalculationHistory', JSON.stringify(calculationHistory));
    loadHistory();
}

function clearHistory() {
    if (confirm('Apakah Anda yakin ingin menghapus semua riwayat perhitungan?')) {
        calculationHistory = [];
        localStorage.removeItem('pieCalculationHistory');
        loadHistory();
    }
}

function loadFromHistory(index) {
    const item = calculationHistory[index];
    if (item && item.inputs) {
        setMode(item.mode || 3);
        
        document.getElementById('totalPopulasi').value = item.inputs.totalPopulasi;
        inputIds.forEach(id => {
            const element = document.getElementById(id);
            if (element && item.inputs[id] !== undefined) {
                element.value = item.inputs[id];
            }
        });
        updateInputStyles();
        
        displayMessage('Data berhasil dimuat dari riwayat!', 'warning');
    }
}

function getCurrentInputs() {
    const inputs = {
        totalPopulasi: document.getElementById('totalPopulasi').value,
        mode: currentMode
    };
    inputIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            inputs[id] = element.value;
        }
    });
    return inputs;
}

// --- EXPORT FUNCTIONALITY ---
function updateExportButton() {
    const exportBtn = document.getElementById('exportBtn');
    const hasResults = document.getElementById('outputResult').style.display !== 'none';
    exportBtn.classList.toggle('hidden', !hasResults);
}

function exportResults() {
    const resultContent = document.getElementById('resultContent').innerText;
    const timestamp = new Date().toLocaleString();
    const modeText = currentMode === 2 ? '2 Himpunan' : '3 Himpunan';
    
    const exportContent = `HASIL PERHITUNGAN PIE ${modeText.toUpperCase()}
Waktu: ${timestamp}
===============================

${resultContent}

--- 
Dihitung menggunakan Kalkulator PIE ${modeText}
`;

    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hasil-pie-${timestamp.replace(/[/:\\]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// --- FUNGSI BANTU ---
function resetForm() {
    resetFormForMode();
    document.getElementById('outputResult').style.display = 'none';
    clearMessages();
    updateInputStyles();
    updateExportButton();
}

function contohKasus(jenis) {
    resetForm();
    
    if (currentMode === 2) {
        // Contoh kasus untuk 2 himpunan
        switch(jenis) {
            case 1:
                // Cari |A ∪ B|
                document.getElementById('totalPopulasi').value = '100';
                document.getElementById('a').value = '40';
                document.getElementById('b').value = '50';
                document.getElementById('ab').value = '20';
                document.getElementById('unionSize').value = '-1';
                break;
            case 2:
                // Cari |A|
                document.getElementById('totalPopulasi').value = '100';
                document.getElementById('a').value = '-1';
                document.getElementById('b').value = '50';
                document.getElementById('ab').value = '20';
                document.getElementById('unionSize').value = '70';
                break;
            case 3:
                // Cari |A ∩ B|
                document.getElementById('totalPopulasi').value = '100';
                document.getElementById('a').value = '40';
                document.getElementById('b').value = '50';
                document.getElementById('ab').value = '-1';
                document.getElementById('unionSize').value = '70';
                break;
        }
    } else {
        // Contoh kasus untuk 3 himpunan
        switch(jenis) {
            case 1:
                // Cari |A ∪ B ∪ C| (default)
                break;
            case 2:
                // Cari |A|
                document.getElementById('totalPopulasi').value = '200';
                document.getElementById('a').value = '-1';
                document.getElementById('b').value = '80';
                document.getElementById('c').value = '60';
                document.getElementById('ab').value = '25';
                document.getElementById('ac').value = '20';
                document.getElementById('bc').value = '30';
                document.getElementById('abc').value = '10';
                document.getElementById('unionSize').value = '150';
                break;
            case 3:
                // Cari |A ∩ B|
                document.getElementById('totalPopulasi').value = '200';
                document.getElementById('a').value = '80';
                document.getElementById('b').value = '90';
                document.getElementById('c').value = '70';
                document.getElementById('ab').value = '-1';
                document.getElementById('ac').value = '25';
                document.getElementById('bc').value = '30';
                document.getElementById('abc').value = '15';
                document.getElementById('unionSize').value = '165';
                break;
        }
    }
    updateInputStyles();
}

// Event Listeners
document.getElementById('themeToggle').addEventListener('click', toggleTheme);