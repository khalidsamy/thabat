import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Generates a high-quality PDF report for the user's progress.
 * Uses html2canvas for capturing a high-fidelity hidden DOM element.
 */
export const generateProgressReport = async (user, progress, t, isArabic) => {
  const reportId = 'thabat-report-render-target';
  
  // 1. Create a hidden element for rendering
  const container = document.createElement('div');
  container.id = reportId;
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.backgroundColor = '#020617'; // slate-950
  container.style.color = '#f8fafc'; // slate-50
  container.style.padding = '40px';
  container.style.fontFamily = 'Inter, system-ui, sans-serif';
  container.setAttribute('dir', isArabic ? 'rtl' : 'ltr');

  // 2. Build the HTML Content
  container.innerHTML = `
    <div style="border: 2px solid #10b981; border-radius: 40px; padding: 40px; background: linear-gradient(135deg, #020617 0%, #064e3b 100%);">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(16, 185, 129, 0.2); padding-bottom: 30px; margin-bottom: 40px;">
        <div style="flex: 1;">
          <h1 style="font-size: 36px; font-weight: 900; margin: 0; color: #fff; letter-spacing: -1px; text-align: ${isArabic ? 'right' : 'left'};">
            ${isArabic ? 'تقارير الثبات' : 'THABAT REPORT'}
          </h1>
          <p style="font-size: 14px; color: #10b981; font-weight: 800; text-transform: uppercase; margin-top: 5px; letter-spacing: 2px;">
            ${isArabic ? 'رحلة حفظ القرآن الكريم' : 'Quranic Journey Analytics'}
          </p>
        </div>
        <div style="text-align: right;">
           <img src="/ThabatLogo.png" style="height: 60px; filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.3));" />
        </div>
      </div>

      <!-- User Info Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 50px;">
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 25px; padding: 25px;">
           <p style="font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 5px;">${isArabic ? 'اسم المستخدم' : 'USER NAME'}</p>
           <p style="font-size: 20px; font-weight: 900; color: #fff; margin: 0;">${user?.name || 'A Servant of Allah'}</p>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 25px; padding: 25px;">
           <p style="font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 5px;">${isArabic ? 'الخطة الحالية' : 'CURRENT PLAN'}</p>
           <p style="font-size: 20px; font-weight: 900; color: #fbbf24; margin: 0;">${progress?.revisionGoal || 'Balanced'}</p>
        </div>
      </div>

      <!-- Stats -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 50px;">
         ${[
           { label: isArabic ? 'الصفحات' : 'PAGES', val: progress?.totalMemorized || 0 },
           { label: isArabic ? 'الاستمرارية' : 'STREAK', val: `${progress?.streak || 0}d` },
           { label: isArabic ? 'الهدف' : 'DAILY', val: progress?.dailyTarget || 0 },
           { label: isArabic ? 'الجزء' : 'JUZ', val: Math.floor((progress?.totalMemorized || 0) / 20) }
         ].map(s => `
           <div style="text-align: center; background: rgba(16, 185, 129, 0.05); border-radius: 20px; padding: 20px; border-bottom: 3px solid #10b981;">
              <p style="font-size: 10px; font-weight: 900; color: #64748b; margin-bottom: 5px;">${s.label}</p>
              <p style="font-size: 24px; font-weight: 900; color: #fff; margin: 0;">${s.val}</p>
           </div>
         `).join('')}
      </div>

      <!-- Mastery Section -->
      <div style="margin-bottom: 50px;">
         <h2 style="font-size: 18px; font-weight: 900; color: #fff; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            ${isArabic ? 'تحليل المواضع الضعيفة' : 'STABILITY ANALYSIS'}
         </h2>
         <div style="background: rgba(255,255,255,0.03); border-radius: 30px; padding: 30px;">
            ${progress?.weakSurahs?.length > 0 ? `
               <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  ${progress.weakSurahs.slice(0, 6).map(s => `
                    <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(220, 38, 38, 0.1); padding: 12px 20px; border-radius: 15px; border-left: 3px solid #ef4444;">
                       <span style="font-weight: 900; color: #fff; font-size: 14px;">${s.surahName}</span>
                       <span style="font-size: 11px; font-weight: 800; color: #ef4444;">${isArabic ? 'بحاجة لتثبيت' : 'NEEDS ATTENTION'}</span>
                    </div>
                  `).join('')}
               </div>
            ` : `
               <p style="text-align: center; color: #10b981; font-weight: 800; margin: 0;">${isArabic ? 'ما شاء الله! لا توجد مواضع ضعف حالياً.' : 'MashaAllah! All positions are solid.'}</p>
            `}
         </div>
      </div>

      <!-- Footer Quote -->
      <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 30px;">
         <p style="font-size: 16px; font-style: italic; color: #94a3b8; line-height: 1.6; max-width: 80%; margin: 0 auto;">
            ${isArabic 
              ? '"تَعهَّدوا هذا القُرآنَ، فَوالذي نَفْسِي بيَدِهِ لَهُوَ أشَدُّ تَفَلُّتًا مِنَ الإبِلِ في عُقُلِها"'
              : '"Keep refreshing the Quran, for by Him in Whose Hand is my soul, it is more likely to escape than camels in their hobbles."'}
         </p>
         <div style="margin-top: 30px; display: flex; justify-content: center; align-items: center; gap: 20px;">
            <div style="height: 1px; width: 40px; background: rgba(16, 185, 129, 0.3);"></div>
            <p style="font-size: 12px; font-weight: 900; color: #475569; letter-spacing: 3px;">GENERATED BY THABAT APP</p>
            <div style="height: 1px; width: 40px; background: rgba(16, 185, 129, 0.3);"></div>
         </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      backgroundColor: '#020617',
      scale: 2, // Higher resolution
      logging: false,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // 4. Handle Save or Share
    const fileName = `Thabat_Progress_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    
    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      const blob = pdf.output('blob');
      const file = new File([blob], fileName, { type: 'application/pdf' });
      
      await navigator.share({
        files: [file],
        title: 'My Thabat Progress Report',
        text: 'Alhamdulillah, tracing my path with the Quran on Thabat!'
      }).catch(err => {
        if (err.name !== 'AbortError') pdf.save(fileName);
      });
    } else {
      pdf.save(fileName);
    }
  } catch (err) {
    console.error('PDF generation failed:', err);
    throw err;
  } finally {
    document.body.removeChild(container);
  }
};
