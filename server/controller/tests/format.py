for file_no in range(10):
	input_file = open(str(file_no) + '.txt', 'r')
	output_file = open('data/' + str(file_no) + '.json', 'w')
	output_file.write('')

	output_file = open('data/' + str(file_no) + '.json', 'a')

	output_file.write('{\n')
	output_file.write('\t\"train\": [\n')
	for line in input_file.read().splitlines():
		if line.strip() == '':
			output_file.write('\t],\n')
			output_file.write('\t\"test\": [\n')
			continue

		attrs = line.replace('\\', '\\\\').replace('\"', '\\\"').split('|')
		output_file.write('\t\t{\n')
		output_file.write('\t\t\t\"message\": \"' + attrs[0] + '\",\n')
		output_file.write('\t\t\t\"classification\": \"' + attrs[1] + '\"\n')
		output_file.write('\t\t},\n')

	output_file.write('\t]\n')
	output_file.write('}\n')

	input_file.close()
	output_file.close()

print 'Done!'