<?php
namespace Synergize\Bundle\DbalBundle;

use Synergize\Bundle\DbalBundle\Driver\SynergizeException;

class Synergize
{
    /**
     * @var resource
     */
    protected $curl;

    /**
     * @var string
     */
    protected $lastStatusCode;

    /**
     * @var string
     */
    protected $lastErrorMessage;

    public function __construct($host, $port, $protocol, $username, $password)
    {
        $this->curl = curl_init();

        curl_setopt($this->curl, CURLOPT_URL, sprintf('%s://%s:%s/fm', $protocol, $host, $port));
        curl_setopt($this->curl, CURLOPT_USERPWD, $username . ':' . $password);
        curl_setopt($this->curl, CURLOPT_ENCODING , 'gzip');
        curl_setopt($this->curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($this->curl, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, true);
    }

    public function __destruct()
    {
        curl_close($this->curl);
    }

    public function evaluate($expression)
    {
        $requestData = array(
            'action' => 'evaluate',
            'query' => $expression
        );

        return $this->execute($requestData);
    }

    public function getLastStatusCode()
    {
        return $this->lastStatusCode;
    }

    public function getLastErrorMessage()
    {
        return $this->lastErrorMessage;
    }

    protected function execute($requestData)
    {
        curl_setopt($this->curl, CURLOPT_POST, count($requestData));
        curl_setopt($this->curl, CURLOPT_POSTFIELDS, http_build_query($requestData));

        $response = preg_replace('/[^\x20-\x7E]/','', curl_exec($this->curl));

        if ($response === false) {
            $this->lastErrorMessage = curl_error($this->curl);
            $this->lastStatusCode = curl_errno($this->curl);

            throw new SynergizeException($this->lastErrorMessage, $this->lastStatusCode);
        }

        $result = json_decode($response, true);
        $this->lastStatusCode = $result['status'];

        if ($this->lastStatusCode) {
            $this->lastErrorMessage = $result['results'];

            throw new SynergizeException($this->lastErrorMessage, $this->lastStatusCode);
        }

        return $result['results'];
    }
}
