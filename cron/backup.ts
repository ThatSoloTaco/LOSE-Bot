import { CronJob } from 'cron';

export default class Backup {
	cronJob: CronJob;
	loseDatabaseProcess: LoseDatabaseProcess;
	constructor(loseDatabaseProcess: LoseDatabaseProcess, cronString: String){
		
		this.loseDatabaseProcess = loseDatabaseProcess;
		this.cronJob = new CronJob(cronString, async() => {
			try {
				await this.backupDatabase();
			  } catch (e) {
				console.error(e);
			  }
		});
		
		if (!this.cronJob.running) {
		  this.cronJob.start();
		}
	}
	
	async backupDatabase(): Promise<void> {
		console.log('Starting Backup Job');
		await this.loseDatabaseProcess.reopen();
		await this.loseDatabaseProcess.backupDatabase();
		await this.loseDatabaseProcess.close();
		console.log('closed connect');
	}
}