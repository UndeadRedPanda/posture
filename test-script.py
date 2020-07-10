from smtplib import SMTP

with SMTP(port=25) as smtp:
	print(smtp.connect())
	print(smtp.helo())
	print(smtp.sendmail("Mail Sender <mail@mail.mail>", ["Recipient <rcpt@rcpt.rcpt>"], "Message"))
	print(smtp.quit())