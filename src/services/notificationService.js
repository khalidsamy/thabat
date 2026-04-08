/**
 * notificationService.js
 * 📖 MISSION: Smart Pedagogy Reminders (Sheikh Alaa Hamed)
 */

class NotificationService {
  constructor() {
    this.morningTime = 8; // 8:00 AM
    this.eveningTime = 20; // 8:00 PM
  }

  requestPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  }

  send(title, body) {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/ThabatLogo.png',
      });
    }
  }

  /**
   * Checks completion status and sends smart reminders based on time of day.
   * This is called on app load and potentially on a loop.
   */
  checkAndRemind(progress, isArabic = false) {
    if (!progress || progress.revisionGoal === 'NONE') return;

    const now = new Date();
    const hours = now.getHours();
    
    // Check if we already reminded this hour to avoid spamming
    const lastRemindedHour = localStorage.getItem('thabat_last_remind_hour');
    if (lastRemindedHour === hours.toString()) return;

    // Morning Goal (8:00 AM)
    if (hours === this.morningTime && !progress.revisionCompletedToday) {
      const title = isArabic ? 'Assalamu Alaikum! ابدأ وردك اليومي' : 'Assalamu Alaikum! Today\'s goal is 1 Juz.';
      const body = isArabic 
        ? `أنت على خطة ${progress.revisionGoal}. ابدأ الآن لتبقى على المسار الصحيح!`
        : `Start now to stay on track with your ${progress.revisionGoal} goal!`;
      
      this.send(title, body);
      localStorage.setItem('thabat_last_remind_hour', hours.toString());
    }

    // Mid-day Nudge (2:00 PM / 14:00)
    if (hours === 14 && !progress.revisionCompletedToday) {
      const title = isArabic ? 'تذكير منتصف اليوم' : 'Mid-day Nudge';
      const body = isArabic 
        ? 'لم تسجل وردك بعد. 15 دقيقة الآن ستبقي حفظك ثابتاً!'
        : 'You haven\'t logged your revision yet. 15 minutes now will save your Hifz!';
      
      this.send(title, body);
      localStorage.setItem('thabat_last_remind_hour', hours.toString());
    }

    // Evening Follow-up (8:00 PM)
    if (hours === this.eveningTime && !progress.revisionCompletedToday) {
      const title = isArabic ? 'تذكير ورد المساء' : 'Evening Wird Reminder';
      const body = isArabic 
        ? 'شارف اليوم على الانتهاء ولم تكمل ورد المراجعة. ثباتك يزداد باستمرارك!'
        : 'The day is almost over and your revision is not yet complete. Consistency is key to Thabat!';
      
      this.send(title, body);
      localStorage.setItem('thabat_last_remind_hour', hours.toString());
    }

    // Streak Milestone (7, 30, 100 days)
    if (progress.streak > 0 && [7, 30, 100].includes(progress.streak)) {
      const title = isArabic ? 'تحفيز الثبات!' : 'Thabat Streak!';
      const body = isArabic
        ? `ما شاء الله! لقد أتممت ${progress.streak} أيام من الاستمرارية.`
        : `MashaAllah! You've reached a ${progress.streak} days streak. Consistency is your strength!`;
      
      this.send(title, body);
    }

    // Inactivity Nudge (12:00 PM - 4 hours after Morning Goal)
    if (hours === 12 && !progress.revisionCompletedToday && progress.doneToday === 0) {
      const title = isArabic ? 'تذكير بالثبات' : 'Nudge: Stay Consistent!';
      const body = isArabic 
        ? 'لقد مرت 4 ساعات على ورد الصباح ولم تبدأ بعد. القليل الدائم خير من الكثير المنقطع!'
        : 'It\'s been 4 hours since your morning goal. 15 minutes now will save your Hifz!';
      
      this.send(title, body);
      localStorage.setItem('thabat_last_remind_hour', hours.toString());
    }
  }
}

export default new NotificationService();
