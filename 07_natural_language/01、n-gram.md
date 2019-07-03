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

