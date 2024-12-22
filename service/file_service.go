package service

import (
	repository "a21hc3NpZ25tZW50/repository/fileRepository"
	"bytes"
	"encoding/csv"
	"fmt"
	"log"
	"strings"
	"github.com/xuri/excelize/v2"
)

type FileService struct {
	Repo *repository.FileRepository
}

func (s *FileService) ProcessFile(fileContent string) (map[string][]string, error) {
	if strings.TrimSpace(fileContent) == ""{
		return nil, fmt.Errorf("empty CSV data")
	}
	
	reader := csv.NewReader(strings.NewReader(fileContent))
	records, err := reader.ReadAll()
	if err != nil{
		return nil, fmt.Errorf("failed to read CSV data: %w", err)
	}

	log.Println("Parsed records:", records)
	
	headers := records[0]
	data := make(map[string][]string)

	for _, record := range records[1:]{
		if len(record) != len(headers){
			return nil, fmt.Errorf("invalid CSV data")
		}
		for i, header := range headers{
			data[header] = append(data[header], record[i])
		}
		log.Printf("Row: %v\n", record)
	}

	return data, nil
	// TODO: replace this
}
func (s *FileService) ProcessFileExcel(fileContent []byte) (map[string][]string, error) {
	f, err := excelize.OpenReader(bytes.NewReader(fileContent))
	if err != nil{
		return nil, fmt.Errorf("failed to open Excel file: %v", err)
	}
	
	data := make(map[string][]string)

	sheetNames := f.GetSheetList()
	for _, sheetName := range sheetNames{
		rows, err := f.GetRows(sheetName)
		if err != nil{
			return nil, fmt.Errorf("failed to get rows from sheet %s: %v", sheetName, err)
		}
	
	headers := rows[0]
	for _, row:= range rows[1:]{
		if len(row) != len(headers){
			return nil, fmt.Errorf("invalid excel data")
		}
		for i, header := range headers{
			data[header] = append(data[header], row[i])
		}
	}
}

	return data, nil
	// TODO: replace this
}
