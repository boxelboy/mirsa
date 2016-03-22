<?php
namespace Synergize\Bundle\DbalBundle\Type;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * ContainerField
 *
 * @author Jack Murdoch <jack@computech-it.co.uk>
 * @link   http://git.computech-it.co.uk/synergize/SynergizeDbalBundle.git
 */
class ContainerField
{
    /**
     * @var string
     */
    protected $name;

    /**
     * @var array
     */
    protected $streams = array();

    /**
     * @var string
     */
    protected $extension;

    /**
     * @var UploadedFile
     */
    protected $file;

    /**
     * @param string       $url
     * @param UploadedFile $file
     */
    public function __construct(array $json = null, UploadedFile $file = null)
    {
        if (is_array($json)) {
            $this->name = $json['name'];

            foreach ($json['streams'] as $stream) {
                $this->streams[$stream['type']] = array(
                    'url' => $stream['url'],
                    'priority' => $stream['priority']
                );
            }

            $this->extension = pathinfo($this->name, PATHINFO_EXTENSION);
        } else if ($file) {
            $this->file = $file;
            $this->extension = $file->getExtension();
        }
    }

    /**
     * return bool
     */
    public function isUploadedFile()
    {
        return !empty($this->file);
    }

    /**
     * @return string
     */
    public function getUrl()
    {
        return $this->streams['FILE']['url'];
        //return $this->streams[count($this->streams)- 1]['url'];
    }

    /**
     * @return string
     */
    public function getEncodedUrl()
    {
        return base64_encode($this->getUrl());
    }

    /**
     * @return array
     */
    public function getStreams()
    {
        return array_keys($this->streams);
    }

    /**
     * @param string $stream
     *
     * @return bool
     */
    public function hasStream($stream)
    {
        return array_key_exists($stream, $this->streams);
    }

    /**
     * @param string $stream
     *
     * @return integer
     */
    public function getStreamPriority($stream)
    {
        return $this->streams[$stream]['priority'];
    }

    /**
     * @param string $stream
     *
     * @return string
     */
    public function getStreamUrl($stream)
    {
        return $this->streams[$stream]['url'];
    }

    /**
     * @param string $stream
     *
     * @return string
     */
    public function getEncodedStreamUrl($stream)
    {
        return base64_encode($this->getStreamUrl($stream));
    }

    /**
     * @return UploadedFile
     */
    public function getUploadedFile()
    {
        return $this->file;
    }

    /**
     * @return string
     */
    public function getContentType()
    {
        $map = array(
            'js'   => 'application/javascript',
            'json' => 'application/json',
            'pdf'  => 'application/pdf',
            'aac'  => 'audio/x-aac',
            'bmp'  => 'image/bmp',
            'gif'  => 'image/gif',
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'swf'  => 'application/x-shockwave-flash',
            'css'  => 'text/css',
            'htm'  => 'text/html',
            'html' => 'text/html',
            'avi'  => 'video/x-msvideo'
        );

        if (isset($map[$this->extension])) {
            return $map[$this->extension];
        }

        return 'application/octet-stream';
    }
}
