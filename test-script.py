from smtplib import SMTP

with SMTP(port=25) as smtp:
	print(smtp.connect())
	print(smtp.helo())
	print(smtp.mail("mail@mail.mail"))
	print(smtp.rcpt("rcpt@rcpt.rcpt"))
	print(smtp.data("This is my message"))
	print(smtp.quit())