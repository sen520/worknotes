n-gram模型：指的是文字或语言中的n个连续的单词组成的序列。

```python
def ngrams(input, n):
	input = input.split(' ')
	output = {}
	for i in range(len(input)- n + 1):
		ngramTemp = ' '.join(input[i: i+n])
		if ngramTemp not in output:
			output[ngramTemp] = 0
		output[ngramTemp] += 1
	return output

name = 'i am zs, i like eat'
result = ngrams(name, 2)
print(result)
```

判断是否是常用的no-use单词

```python
def isCommon(ngram):
	commonWords = ["the", "be", "and", "of", "a", "in", "to", "have", "it",
	"i", "that", "for", "you", "he", "with", "on", "do", "say", "this",
	"they", "is", "an", "at", "but","we", "his", "from", "that", "not",
	"by", "she", "or", "as", "what", "go", "their","can", "who", "get",
	"if", "would", "her", "all", "my", "make", "about", "know", "will",
	"as", "up", "one", "time", "has", "been", "there", "year", "so",
	"think", "when", "which", "them", "some", "me", "people", "take",
	"out", "into", "just", "see", "him", "your", "come", "could", "now",
	"than", "like", "other", "how", "then", "its", "our", "two", "more",
	"these", "want", "way", "look", "first", "also", "new", "because",
	"day", "more", "use", "no", "man", "find", "here", "thing", "give",
	"many", "well"]
	for word in ngram:
		if word in commonWords:
			return True
	return False
```



样例

```python
import re
def ngrams(input, n):
	input = re.split('\s', input)
	output = []
	for i in range(len(input)- n + 1):
		ngramTemp = ' '.join(input[i: i+n]).strip()
		if ngramTemp not in output and ngramTemp != '':
			output.append(ngramTemp)
	return output

def isCommon(ngram):
	commonWords = ["the", "be", "and", "of", "a", "in", "to", "have", "it",
	"i", "that", "for", "you", "he", "with", "on", "do", "say", "this",
	"they", "is", "an", "at", "but","we", "his", "from", "that", "not",
	"by", "she", "or", "as", "what", "go", "their","can", "who", "get",
	"if", "would", "her", "all", "my", "make", "about", "know", "will",
	"as", "up", "one", "time", "has", "been", "there", "year", "so",
	"think", "when", "which", "them", "some", "me", "people", "take",
	"out", "into", "just", "see", "him", "your", "come", "could", "now",
	"than", "like", "other", "how", "then", "its", "our", "two", "more",
	"these", "want", "way", "look", "first", "also", "new", "because",
	"day", "more", "use", "no", "man", "find", "here", "thing", "give",
	"many", "well"]
	word_list = []
	for word in ngram:
		flag = False
		for w in word.split(' '):
			if w in commonWords:
				flag = True
		if flag == True:
			continue
		word_list.append(word)
	return word_list

def word_count(content):
	word_dict = {}
	for word in content:
		for w in word.split(' '):
			if re.search('\d', w):
				continue
			if w not in word_dict.keys():
				word_dict[w] = 0
			word_dict[w] += 1
	return sorted(word_dict.items(),key=lambda x:x[1],reverse=True)

content = """
Fremont is a city in the San Francisco Bay Area known for its innovative ecosystem and rapidly growing economy. It is home to Tesla and has many thriving green energy and biotechnology ventures. Fremont is the number one city in start-up per capita and ranks number two in patents per capita in the United States.
Dr. Yang Shao received his Ph.D. degree in Chemical Biology from Harvard and currently is a Fremont city councilmember. He provides his insights on the success of the local entrepreneurship environment using Fremont as an example. He talks about the key factors to building an innovative ecosystem, how local government can boost innovation and economic development, the support government provides for SMEs and his perspective on international collaborations in the United States.
Topics covered in this special interview:
1.	Key factors to creating an innovative ecosystem for entrepreneurship
2.	The role the local government plays in building an innovative ecosystem
3.	Support programs and policies local and the federal government provides for SMEs
4.	Biotechnology industry development in Fremont
5.	International collaboration and the future of US-China relations"""
get_word_dict = ngrams(content, 2)
final_result = isCommon(get_word_dict)
word_count_result = word_count(final_result)
print(word_count_result)

```



